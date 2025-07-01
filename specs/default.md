# Task Management App Specification

## Project Overview
Build a simple task management application that allows users to create, read, update, and delete tasks.

## Core Features
- Create new tasks with title and description
- Mark tasks as complete/incomplete
- Delete tasks
- Filter tasks by status (all, active, completed)
- Responsive design for mobile and desktop

## Technical Requirements
- Next.js with TypeScript
- Tailwind CSS for styling
- Local state management (useState)
- RESTful API endpoints

## Acceptance Criteria
- [ ] User can add a new task
- [ ] User can mark tasks as complete
- [ ] User can delete tasks
- [ ] Tasks persist during session
- [ ] Responsive design works on mobile
- [ ] Clean, modern UI

## API Endpoints
- GET /api/tasks - Get all tasks
- POST /api/tasks - Create new task
- PUT /api/tasks/[id] - Update task
- DELETE /api/tasks/[id] - Delete task

## Timeline Estimate
2-3 hours for basic implementation 