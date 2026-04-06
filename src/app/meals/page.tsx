"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMeals, MealItem } from "@/hooks/useMeals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryType = "Strictly Avoid" | "Safe Groceries" | "Recipes";

export default function MealsPage() {
  const { user } = useAuth();
  const { meals, loading, addFood, deleteFood } = useMeals();

  const [newName, setNewName] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [category, setCategory] = useState<CategoryType>("Strictly Avoid");

  const handleCreate = async () => {
    if (!newName.trim() || !user) return;
    await addFood(newName.trim(), category, newNotes.trim(), user.uid);
    setNewName("");
    setNewNotes("");
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-12">
        <p className="text-slate-500 animate-pulse font-medium">Loading pantry...</p>
      </div>
    );
  }

  const avoidMeals = meals.filter((m) => m.category === "Strictly Avoid");
  const clearMeals = meals.filter((m) => m.category === "Safe Groceries");
  const recipeMeals = meals.filter((m) => m.category === "Recipes");

  const MealList = ({ list, isAvoidTab }: { list: typeof meals; isAvoidTab: boolean }) => {
    if (list.length === 0) {
      if (isAvoidTab) {
        return (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-red-200 mt-4 shadow-sm">
            <Ban className="mx-auto mb-2 text-red-300" size={24} />
            <p className="text-slate-500 font-medium text-sm">
              Don't forget to add things like Zobo and Snail!
            </p>
          </div>
        );
      }
      return (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 mt-4 shadow-sm">
          <p className="text-slate-400 font-medium text-sm">
            Nothing logged here yet.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pb-8">
        {list.map((meal) => (
          <Card 
            key={meal.id} 
            className={cn(
              "p-4 rounded-2xl flex flex-col gap-2 shadow-sm transition-all duration-300",
              isAvoidTab ? "border-red-300 bg-red-50/50" : "border-slate-200 bg-white"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isAvoidTab && <Ban size={18} className="text-red-500" strokeWidth={2.5} />}
                <span className={cn(
                  "font-bold text-lg leading-tight",
                  isAvoidTab ? "text-red-900" : "text-slate-800"
                )}>
                  {meal.name}
                </span>
              </div>
              <button 
                onClick={() => deleteFood(meal.id)} 
                className={cn(
                  "transition-colors p-2 rounded-full",
                  isAvoidTab ? "text-red-300 hover:text-red-600 hover:bg-red-100" : "text-slate-300 hover:text-red-500 hover:bg-slate-50"
                )}
              >
                <Trash2 size={18} />
              </button>
            </div>
            {meal.notes && (
              <p className={cn(
                "text-sm font-medium pl-0.5",
                isAvoidTab ? "text-red-700/80" : "text-slate-500"
              )}>
                {meal.notes}
              </p>
            )}
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-md md:max-w-5xl mx-auto md:px-8 flex flex-col">
        
        {/* Sticky Header / Input */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md pt-6 pb-4 px-4 z-10 border-b border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-4">Diet & Meals</h1>
          
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <div className="flex items-center gap-3 w-full">
               <div className="flex-1 min-w-0">
                 <Select value={category} onValueChange={(val) => setCategory(val as CategoryType)}>
                  <SelectTrigger className="w-full rounded-full border-slate-200 bg-slate-50 text-sm font-medium h-10 outline-none focus-visible:ring-1 focus-visible:ring-indigo-600">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-lg border-slate-100 pb-2">
                    <SelectItem value="Strictly Avoid" className="font-bold cursor-pointer text-red-600 focus:bg-red-50 py-2">🚫 Strictly Avoid</SelectItem>
                    <SelectItem value="Safe Groceries" className="font-medium cursor-pointer py-2">🛒 Safe Groceries</SelectItem>
                    <SelectItem value="Recipes" className="font-medium cursor-pointer py-2">🍳 Recipes</SelectItem>
                  </SelectContent>
                </Select>
               </div>
            </div>

            <Input
              placeholder={category === "Strictly Avoid" ? "e.g. Raw Sushi..." : "e.g. Greek Yogurt..."}
              className="border-slate-100 bg-slate-50 rounded-full focus-visible:ring-indigo-600 h-10 px-5 font-bold text-slate-800"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            
            <Input
              placeholder="Any notes? (Optional)"
              className="border-slate-100 bg-slate-50 rounded-full focus-visible:ring-indigo-600 h-10 px-5 text-sm"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
            
            <Button 
              onClick={handleCreate}
              disabled={!newName.trim()}
              className={cn(
                "w-full rounded-full font-bold h-10 text-xs tracking-wide uppercase transition-transform active:scale-95 mt-1",
                category === "Strictly Avoid" 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-indigo-600 hover:bg-indigo-700"
              )}
            >
              Add to {category.split(" ")[0]}
            </Button>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="px-4 pt-4">
          <Tabs defaultValue="Strictly Avoid" className="w-full">
            <TabsList className="w-full flex bg-slate-200/50 p-1.5 rounded-2xl h-12 overflow-hidden shadow-inner">
              <TabsTrigger value="Strictly Avoid" className="rounded-xl flex-1 text-[11px] px-1 font-bold data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">Avoid</TabsTrigger>
              <TabsTrigger value="Safe Groceries" className="rounded-xl flex-1 text-[11px] px-1 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all">Groceries</TabsTrigger>
              <TabsTrigger value="Recipes" className="rounded-xl flex-1 text-[11px] px-1 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all">Recipes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="Strictly Avoid" className="outline-none">
              <MealList list={avoidMeals} isAvoidTab={true} />
            </TabsContent>
            <TabsContent value="Safe Groceries" className="outline-none">
              <MealList list={clearMeals} isAvoidTab={false} />
            </TabsContent>
            <TabsContent value="Recipes" className="outline-none">
              <MealList list={recipeMeals} isAvoidTab={false} />
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}
