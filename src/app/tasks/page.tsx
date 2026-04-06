"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, loading, addTask, toggleTask, deleteTask } = useTasks();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [category, setCategory] = useState<"go-bag" | "todo" | "admin">("go-bag");

  const handleCreate = async () => {
    if (!newTaskTitle.trim() || !user) return;
    await addTask(newTaskTitle.trim(), category, user.uid);
    setNewTaskTitle("");
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
        <div className="w-full max-w-md flex flex-col pt-6 px-4">
          <Skeleton className="h-8 w-48 mb-4 bg-slate-200" />
          <Skeleton className="h-32 w-full rounded-3xl bg-slate-200 mb-6" />
          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl h-12 mb-4 w-full" />
          <div className="flex flex-col gap-3 pb-8">
            <Skeleton className="h-16 w-full rounded-2xl bg-slate-200" />
            <Skeleton className="h-16 w-full rounded-2xl bg-slate-200" />
            <Skeleton className="h-16 w-full rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  const goBagTasks = tasks.filter((t) => t.category === "go-bag");
  const adminTasks = tasks.filter((t) => t.category === "admin");
  const todoTasks = tasks.filter((t) => t.category === "todo");

  const TaskList = ({ list }: { list: typeof tasks }) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 mt-4 shadow-sm">
          <p className="text-slate-400 font-medium text-sm">All clear! No tasks here.</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-3 mt-4 pb-8">
        {list.map((task) => (
          <div 
            key={task.id} 
            className={`flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 ${task.isCompleted ? 'opacity-50 hover:opacity-75' : ''}`}
          >
            <Checkbox 
              checked={task.isCompleted} 
              onCheckedChange={(checked) => toggleTask(task.id, checked as boolean)}
              className="w-5 h-5 rounded-full border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white shadow-sm"
            />
            <span className={`flex-1 font-medium text-sm leading-tight transition-all ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
              {task.title}
            </span>
            <button 
              onClick={() => deleteTask(task.id)}
              className="text-slate-300 hover:text-red-500 transition-colors p-1"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col">
        
        {/* Sticky Header / Input */}
        <div className="sticky top-0 bg-slate-50/90 backdrop-blur-md pt-6 pb-4 px-4 z-10 border-b border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-4">Logistics & Go-Bag</h1>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <Input
              placeholder="What needs tracking...?"
              className="border-slate-100 bg-slate-50 rounded-full focus-visible:ring-indigo-600 h-12 px-5 font-medium"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
            <div className="flex items-center gap-3 w-full">
               <div className="flex-1 min-w-0">
                 <Select value={category} onValueChange={(val) => setCategory(val as "go-bag" | "todo" | "admin")}>
                  <SelectTrigger className="w-full rounded-full border-slate-200 bg-slate-50 text-sm font-medium h-10 outline-none focus-visible:ring-1 focus-visible:ring-indigo-600">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-lg border-slate-100">
                    <SelectItem value="go-bag" className="font-medium cursor-pointer">👜 Go-Bag</SelectItem>
                    <SelectItem value="admin" className="font-medium cursor-pointer">📋 Admin / Docs</SelectItem>
                    <SelectItem value="todo" className="font-medium cursor-pointer">📝 Gen To-Do</SelectItem>
                  </SelectContent>
                </Select>
               </div>
              <Button 
                onClick={handleCreate}
                disabled={!newTaskTitle.trim()}
                className="flex-1 rounded-full bg-indigo-600 hover:bg-indigo-700 font-bold h-10 text-xs tracking-wide uppercase transition-transform active:scale-95 whitespace-nowrap"
              >
                Add Item
              </Button>
            </div>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="px-4 pt-4">
          <Tabs defaultValue="go-bag" className="w-full">
            <TabsList className="w-full flex bg-slate-200/50 p-1.5 rounded-2xl h-12 overflow-hidden shadow-inner">
              <TabsTrigger value="go-bag" className="rounded-xl flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">Go-Bag</TabsTrigger>
              <TabsTrigger value="admin" className="rounded-xl flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">Admin</TabsTrigger>
              <TabsTrigger value="todo" className="rounded-xl flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">To-Do</TabsTrigger>
            </TabsList>
            
            <TabsContent value="go-bag" className="outline-none">
              <TaskList list={goBagTasks} />
            </TabsContent>
            <TabsContent value="admin" className="outline-none">
              <TaskList list={adminTasks} />
            </TabsContent>
            <TabsContent value="todo" className="outline-none">
              <TaskList list={todoTasks} />
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}
