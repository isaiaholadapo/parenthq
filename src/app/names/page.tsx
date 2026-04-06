"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNames } from "@/hooks/useNames";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function NamesPage() {
  const { user } = useAuth();
  const { names, loading, addName, castVote, deleteName } = useNames();

  const [newName, setNewName] = useState("");
  const [category, setCategory] = useState<"General" | "Yoruba">("General");

  const handleCreate = async () => {
    if (!newName.trim() || !user) return;
    await addName(newName.trim(), category);
    setNewName("");
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
        <div className="w-full max-w-md flex flex-col pt-6 px-4">
          <Skeleton className="h-8 w-40 mb-4 bg-slate-200" />
          <Skeleton className="h-32 w-full rounded-3xl bg-slate-200 mb-6" />
          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl h-12 mb-4 w-full" />
          <div className="flex flex-col gap-3 pb-8">
            <Skeleton className="h-24 w-full rounded-2xl bg-slate-200" />
            <Skeleton className="h-24 w-full rounded-2xl bg-slate-200" />
            <Skeleton className="h-24 w-full rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  const brainstormNames = names.filter((n) => !n.isMatch);
  const matchedNames = names.filter((n) => n.isMatch);

  // Reusable sub-component to render the lists
  const NameList = ({ list, isMatchTab }: { list: typeof names; isMatchTab: boolean }) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 mt-4 shadow-sm">
          <p className="text-slate-400 font-medium text-sm">
            {isMatchTab ? "No matches yet. Keep voting!" : "The vault is empty. Add a name above!"}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pb-8">
        {list.map((name) => {
          const userVote = user ? name.votes[user.uid] : 0;
          
          return (
            <Card 
              key={name.id} 
              className={cn(
                "p-4 rounded-2xl flex items-center justify-between shadow-sm transition-all duration-300",
                isMatchTab ? "border-green-400 bg-green-50/40" : "bg-white shadow-sm border border-slate-200/60 hover:shadow-md"
              )}
            >
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-lg text-slate-800 leading-tight">
                  {name.name}
                </span>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] uppercase font-bold tracking-widest border-none px-2 py-0.5",
                      name.category === "Yoruba" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {name.category}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isMatchTab ? (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-1 scale-105 pointer-events-none shadow-sm shadow-green-200">Match!</Badge>
                    <button onClick={() => deleteName(name.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"><Trash2 size={18} /></button>
                  </div>
                ) : (
                  <div className="flex items-center bg-slate-50 rounded-full border border-slate-100 p-1 shadow-inner">
                    <button 
                      onClick={() => user && castVote(name.id, user.uid, 1)}
                      className={cn(
                        "p-2 rounded-full transition-all",
                        userVote === 1 ? "bg-indigo-100 text-indigo-700 scale-105 shadow-sm" : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                      )}
                    >
                      <ThumbsUp size={18} strokeWidth={userVote === 1 ? 2.5 : 2} />
                    </button>
                    <div className="w-[1px] h-6 bg-slate-200 mx-1" />
                    <button 
                      onClick={() => user && castVote(name.id, user.uid, -1)}
                      className={cn(
                        "p-2 rounded-full transition-all",
                        userVote === -1 ? "bg-red-100 text-red-600 scale-105 shadow-sm" : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                      )}
                    >
                      <ThumbsDown size={18} strokeWidth={userVote === -1 ? 2.5 : 2} />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-md md:max-w-5xl mx-auto md:px-8 flex flex-col">
        
        {/* Sticky Header / Input */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md pt-6 pb-4 px-4 z-10 border-b border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-4">Name Vault</h1>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <Input
              placeholder="Suggest a baby name..."
              className="border-slate-100 bg-slate-50 rounded-full focus-visible:ring-indigo-600 h-12 px-5 font-medium"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
            <div className="flex items-center gap-3 w-full">
               <div className="flex-1 min-w-0">
                 <Select value={category} onValueChange={(val) => setCategory(val as "General" | "Yoruba")}>
                  <SelectTrigger className="w-full rounded-full border-slate-200 bg-slate-50 text-sm font-medium h-10 outline-none focus-visible:ring-1 focus-visible:ring-indigo-600">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-lg border-slate-100">
                    <SelectItem value="General" className="font-medium cursor-pointer">🌍 General</SelectItem>
                    <SelectItem value="Yoruba" className="font-medium cursor-pointer">🇳🇬 Yoruba</SelectItem>
                  </SelectContent>
                </Select>
               </div>
              <Button 
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 rounded-full bg-indigo-600 hover:bg-indigo-700 font-bold h-10 text-xs tracking-wide uppercase transition-transform active:scale-95 whitespace-nowrap"
              >
                Drop Name
              </Button>
            </div>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="px-4 pt-4">
          <Tabs defaultValue="brainstorm" className="w-full">
            <TabsList className="w-full flex bg-slate-200/50 p-1.5 rounded-2xl h-12 overflow-hidden shadow-inner">
              <TabsTrigger value="brainstorm" className="rounded-xl flex-1 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">Brainstorm</TabsTrigger>
              <TabsTrigger value="matches" className="rounded-xl flex-1 text-sm font-bold data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border data-[state=active]:border-green-200 data-[state=active]:shadow-sm">Matches 🎉</TabsTrigger>
            </TabsList>
            
            <TabsContent value="brainstorm" className="outline-none">
              <NameList list={brainstormNames} isMatchTab={false} />
            </TabsContent>
            <TabsContent value="matches" className="outline-none">
              <NameList list={matchedNames} isMatchTab={true} />
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}
