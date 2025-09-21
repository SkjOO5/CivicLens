import { 
  users, 
  issues, 
  comments,
  type User, 
  type InsertUser,
  type Issue,
  type InsertIssue,
  type Comment,
  type InsertComment
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Issue methods
  getIssue(id: string): Promise<Issue | undefined>;
  getIssues(filters?: {
    state?: string;
    district?: string;
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Issue[]>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: string, updates: Partial<Issue>): Promise<Issue>;
  deleteIssue(id: string): Promise<boolean>;
  getIssuesByUser(userId: string): Promise<Issue[]>;

  // Comment methods
  getCommentsByIssue(issueId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Analytics methods
  getIssueStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private issues: Map<string, Issue>;
  private comments: Map<string, Comment>;

  constructor() {
    this.users = new Map();
    this.issues = new Map();
    this.comments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: "citizen",
      email: insertUser.email || null
    };
    this.users.set(id, user);
    return user;
  }

  async getIssue(id: string): Promise<Issue | undefined> {
    return this.issues.get(id);
  }

  async getIssues(filters?: {
    state?: string;
    district?: string;
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Issue[]> {
    let results = Array.from(this.issues.values());

    if (filters?.state) {
      results = results.filter(issue => issue.state === filters.state);
    }
    if (filters?.district) {
      results = results.filter(issue => issue.district === filters.district);
    }
    if (filters?.category) {
      results = results.filter(issue => issue.category === filters.category);
    }
    if (filters?.status) {
      results = results.filter(issue => issue.status === filters.status);
    }

    // Sort by creation date (newest first)
    results.sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    const offset = filters?.offset || 0;
    const limit = filters?.limit || results.length;
    
    return results.slice(offset, offset + limit);
  }

  async createIssue(insertIssue: InsertIssue): Promise<Issue> {
    const id = randomUUID();
    const now = new Date();
    const issue: Issue = {
      ...insertIssue,
      id,
      status: "new",
      assignedTo: null,
      aiCategory: null,
      aiConfidence: null,
      reportedBy: null,
      createdAt: now,
      updatedAt: now,
      coordinates: insertIssue.coordinates || null,
      imageUrl: insertIssue.imageUrl || null,
    };
    this.issues.set(id, issue);
    return issue;
  }

  async updateIssue(id: string, updates: Partial<Issue>): Promise<Issue> {
    const issue = this.issues.get(id);
    if (!issue) {
      throw new Error("Issue not found");
    }
    
    const updatedIssue = {
      ...issue,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.issues.set(id, updatedIssue);
    return updatedIssue;
  }

  async deleteIssue(id: string): Promise<boolean> {
    return this.issues.delete(id);
  }

  async getIssuesByUser(userId: string): Promise<Issue[]> {
    return Array.from(this.issues.values()).filter(
      issue => issue.reportedBy === userId
    );
  }

  async getCommentsByIssue(issueId: string): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      comment => comment.issueId === issueId
    ).sort((a, b) => 
      new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    );
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      userId: null,
      isInternal: insertComment.isInternal || false,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getIssueStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const allIssues = Array.from(this.issues.values());
    
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    allIssues.forEach(issue => {
      const status = issue.status || "new";
      const category = issue.category || "other";
      const priority = issue.priority || "low";
      
      byStatus[status] = (byStatus[status] || 0) + 1;
      byCategory[category] = (byCategory[category] || 0) + 1;
      byPriority[priority] = (byPriority[priority] || 0) + 1;
    });

    return {
      total: allIssues.length,
      byStatus,
      byCategory,
      byPriority,
    };
  }
}

export const storage = new MemStorage();
