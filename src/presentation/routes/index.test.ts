import { describe, it, expect } from "bun:test";
import app from "./index"; // Import the configured Hono app
import { BusinessError, TechnicalError } from "../../domain/errors/AppError";
import { Hono } from "hono";

describe("Main App Error Handling", () => {
  // We need to create a new instance for testing to add specific routes
  const testApp = new Hono();
  
  // Apply the same error handler to our test instance
  testApp.onError(app.errorHandler);
  
  // Add test-specific routes
  testApp.get("/business-error", c => {
    throw new BusinessError("Business logic failed.");
  });

  testApp.get("/technical-error", c => {
    throw new TechnicalError("A technical problem occurred.");
  });
  
  testApp.get("/generic-error", c => {
    throw new Error("A generic problem occurred.");
  });


  it("should handle BusinessError and return 400", async () => {
    const req = new Request("http://localhost/business-error");
    const res = await testApp.fetch(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({ error: "Business logic failed." });
  });

  it("should handle TechnicalError and return 500", async () => {
    const originalConsoleError = console.error;
    console.error = () => {}; // Suppress console.error

    const req = new Request("http://localhost/technical-error");
    const res = await testApp.fetch(req);
    const json = await res.json();
    
    expect(res.status).toBe(500);
    expect(json).toEqual({ error: "An internal server error occurred." });

    console.error = originalConsoleError; // Restore
  });

  it("should handle generic Error and return 500", async () => {
    const originalConsoleError = console.error;
    console.error = () => {}; // Suppress console.error

    const req = new Request("http://localhost/generic-error");
    const res = await testApp.fetch(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json).toEqual({ error: "An internal server error occurred." });

    console.error = originalConsoleError; // Restore
  });
});
