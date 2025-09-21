import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIssueSchema, insertCommentSchema } from "@shared/schema";
import { categorizeIssue } from "./services/openai";
import { upload, processAndSaveImage } from "./services/upload";
import { getStatesList, getDistrictsList } from "./data/states-districts";
import path from "path";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Location routes
  app.get("/api/states", async (req, res) => {
    try {
      const states = getStatesList();
      res.json(states);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch states" });
    }
  });

  app.get("/api/districts/:stateKey", async (req, res) => {
    try {
      const { stateKey } = req.params;
      const districts = getDistrictsList(stateKey);
      res.json(districts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch districts" });
    }
  });

  // Issue routes
  app.get("/api/issues", async (req, res) => {
    try {
      const { state, district, category, status, limit, offset } = req.query;
      
      const filters = {
        state: state as string,
        district: district as string,
        category: category as string,
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      const issues = await storage.getIssues(filters);
      res.json(issues);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch issues" });
    }
  });

  app.get("/api/issues/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const issue = await storage.getIssue(id);
      
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }
      
      res.json(issue);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch issue" });
    }
  });

  app.post("/api/issues", upload.single("image"), async (req, res) => {
    try {
      const issueData = insertIssueSchema.parse(req.body);
      
      // Process uploaded image if present
      let imageUrl = null;
      if (req.file) {
        imageUrl = await processAndSaveImage(req.file.buffer, req.file.originalname);
      }

      // Create the issue
      const issue = await storage.createIssue({
        ...issueData,
        imageUrl,
      });

      // Use AI to categorize the issue
      try {
        const aiResult = await categorizeIssue(issueData.description, issueData.title);
        await storage.updateIssue(issue.id, {
          aiCategory: aiResult.category,
          aiConfidence: aiResult.confidence,
        });
      } catch (aiError) {
        console.error("AI categorization failed:", aiError);
        // Continue without AI categorization
      }

      const updatedIssue = await storage.getIssue(issue.id);
      res.status(201).json(updatedIssue);
    } catch (error) {
      console.error("Error creating issue:", error);
      res.status(400).json({ error: "Failed to create issue" });
    }
  });

  app.patch("/api/issues/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const issue = await storage.updateIssue(id, updates);
      res.json(issue);
    } catch (error) {
      res.status(400).json({ error: "Failed to update issue" });
    }
  });

  app.delete("/api/issues/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteIssue(id);
      
      if (!success) {
        return res.status(404).json({ error: "Issue not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete issue" });
    }
  });

  // Comments routes
  app.get("/api/issues/:issueId/comments", async (req, res) => {
    try {
      const { issueId } = req.params;
      const comments = await storage.getCommentsByIssue(issueId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/issues/:issueId/comments", async (req, res) => {
    try {
      const { issueId } = req.params;
      const commentData = insertCommentSchema.parse({
        ...req.body,
        issueId,
      });
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: "Failed to create comment" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const stats = await storage.getIssueStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
