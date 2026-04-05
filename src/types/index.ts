export interface Family {
  id: string; // Document ID
  dueDate: Date; // For counting weeks and tracking ETA
  actualBirthDate?: Date; // Set when mode goes to postpartum
  mode: "pregnancy" | "postpartum"; // Global state toggle
  midwifePhone: string;
  triagePhone: string;
  maternityUnitRoute: string; // Maps URL
}

export interface Task {
  id: string;
  title: string;
  category: "go-bag" | "todo" | "admin";
  isCompleted: boolean;
  priority: "high" | "normal";
  addedBy: string; // User ID
  createdAt: Date;
  completedAt: Date | null;
}

export interface DoctorQuestion {
  id: string;
  question: string;
  answer: string;
  isResolved: boolean;
  priority: "high" | "normal";
  addedBy: string; // User ID
  createdAt: Date;
}

export interface NameIdea {
  id: string;
  name: string;
  category: "Yoruba" | "General";
  votes: Record<string, number>; // Record of userId -> vote value (1, -1, 0)
  createdAt: Date;
}

export interface Food {
  id: string;
  name: string;
  category: "Strictly Avoid" | "Grocery" | "Recipe";
  notes: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  title: string;
  url: string;
  price: number;
  status: "Idea" | "Approved" | "Purchased";
  votes: Record<string, number>; // Record of userId -> vote value (1, -1, 0)
  createdAt: Date;
}

export interface BudgetItem {
  id: string;
  title: string;
  amountAllocated: number;
  amountSpent: number;
  addedBy: string; // User ID
  createdAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  date: Date;
  imageUrl: string; 
  notes: string;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  title: string;
  date: Date;
  location: string;
  notes: string;
  createdAt: Date;
}

export interface Discussion {
  id: string;
  topic: string;
  notes: string;
  createdAt: Date;
}
