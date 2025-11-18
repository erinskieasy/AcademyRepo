import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { insertAssetSchema, insertQuizSchema, insertCourseSchema, insertSectionSchema, quizJsonSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const objectStorageService = new ObjectStorageService();

  // Course routes
  
  // Get all courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  // Get course by ID with sections and assets
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      
      // Get sections for this course
      const sections = await storage.getSectionsByCourseId(req.params.id);
      
      // Get assets and quizzes for each section
      const sectionsWithContent = await Promise.all(
        sections.map(async (section) => {
          const assets = await storage.getAssetsBySectionId(section.id);
          const quizzes = await storage.getQuizzesBySectionId(section.id);
          return {
            ...section,
            assets,
            quizzes,
          };
        })
      );
      
      res.json({
        ...course,
        sections: sectionsWithContent,
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ error: "Failed to fetch course" });
    }
  });

  // Create new course
  app.post("/api/courses", async (req, res) => {
    try {
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(validatedData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid course data", details: error.errors });
      } else {
        console.error("Error creating course:", error);
        res.status(500).json({ error: "Failed to create course" });
      }
    }
  });

  // Delete course
  app.delete("/api/courses/:id", async (req, res) => {
    try {
      await storage.deleteCourse(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

  // Section routes
  
  // Get sections by course ID
  app.get("/api/sections", async (req, res) => {
    try {
      const courseId = req.query.courseId as string;
      if (!courseId) {
        return res.status(400).json({ error: "courseId query parameter is required" });
      }
      const sections = await storage.getSectionsByCourseId(courseId);
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ error: "Failed to fetch sections" });
    }
  });

  // Create new section
  app.post("/api/sections", async (req, res) => {
    try {
      const validatedData = insertSectionSchema.parse(req.body);
      const section = await storage.createSection(validatedData);
      res.status(201).json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid section data", details: error.errors });
      } else {
        console.error("Error creating section:", error);
        res.status(500).json({ error: "Failed to create section" });
      }
    }
  });

  // Delete section
  app.delete("/api/sections/:id", async (req, res) => {
    try {
      await storage.deleteSection(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({ error: "Failed to delete section" });
    }
  });

  // Asset routes
  
  // Get all assets
  app.get("/api/assets", async (req, res) => {
    try {
      const assets = await storage.getAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ error: "Failed to fetch assets" });
    }
  });

  // Create new asset
  app.post("/api/assets", async (req, res) => {
    try {
      const validatedData = insertAssetSchema.parse(req.body);
      
      // Normalize object storage URLs
      if (validatedData.url.startsWith("https://storage.googleapis.com/")) {
        validatedData.url = objectStorageService.normalizeObjectEntityPath(validatedData.url);
      }
      
      const asset = await storage.createAsset(validatedData);
      res.status(201).json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid asset data", details: error.errors });
      } else {
        console.error("Error creating asset:", error);
        res.status(500).json({ error: "Failed to create asset" });
      }
    }
  });

  // Delete asset
  app.delete("/api/assets/:id", async (req, res) => {
    try {
      await storage.deleteAsset(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting asset:", error);
      res.status(500).json({ error: "Failed to delete asset" });
    }
  });

  // Get upload URL for object storage
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Serve uploaded files from object storage
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Quiz routes
  
  // Get all quizzes
  app.get("/api/quizzes", async (req, res) => {
    try {
      const quizzes = await storage.getQuizzes();
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ error: "Failed to fetch quizzes" });
    }
  });

  // Get quiz by ID
  app.get("/api/quizzes/:id", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ error: "Failed to fetch quiz" });
    }
  });

  // Create new quiz
  app.post("/api/quizzes", async (req, res) => {
    try {
      // Validate quiz JSON structure
      const jsonValidation = quizJsonSchema.safeParse(req.body.json);
      if (!jsonValidation.success) {
        return res.status(400).json({ 
          error: "Invalid quiz JSON structure", 
          details: jsonValidation.error.errors 
        });
      }
      
      const validatedData = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(validatedData);
      res.status(201).json(quiz);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid quiz data", details: error.errors });
      } else {
        console.error("Error creating quiz:", error);
        res.status(500).json({ error: "Failed to create quiz" });
      }
    }
  });

  // Delete quiz
  app.delete("/api/quizzes/:id", async (req, res) => {
    try {
      await storage.deleteQuiz(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      res.status(500).json({ error: "Failed to delete quiz" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
