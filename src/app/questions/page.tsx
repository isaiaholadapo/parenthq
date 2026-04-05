"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuestions } from "@/hooks/useQuestions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, Circle } from "lucide-react";

export default function QuestionsPage() {
  const { user } = useAuth();
  const { questions, loading, addQuestion, updateAnswer, toggleResolved } = useQuestions();

  const [newQuestion, setNewQuestion] = useState("");
  const [priority, setPriority] = useState<"normal" | "high">("normal");
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});

  const handleCreate = async () => {
    if (!newQuestion.trim() || !user) return;
    await addQuestion(newQuestion.trim(), priority, user.uid);
    setNewQuestion("");
    setPriority("normal");
  };

  const handleUpdateAnswer = async (id: string, currentVal: string) => {
    const draft = answerDrafts[id];
    if (draft !== undefined && draft !== currentVal) {
      await updateAnswer(id, draft);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 animate-pulse font-medium">Loading questions...</p>
      </div>
    );
  }

  const activeQuestions = questions.filter((q) => !q.isResolved);
  const resolvedQuestions = questions.filter((q) => q.isResolved);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <div className="w-full max-w-md w-full">
        {/* Sticky Header / Input */}
        <div className="sticky top-0 bg-slate-50/90 backdrop-blur-md pt-6 pb-4 px-4 z-10 border-b border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-4">OBGYN Log</h1>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <Textarea
              placeholder="What do you want to ask the doctor?"
              className="resize-none border-slate-100 bg-slate-50 rounded-2xl focus-visible:ring-indigo-600 focus-visible:ring-1"
              rows={2}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 min-w-0">
                <Select value={priority} onValueChange={(val) => setPriority(val as "normal" | "high")}>
                  <SelectTrigger className="w-full rounded-full border-slate-200 bg-slate-50 text-sm font-medium">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high" className="font-semibold text-indigo-700">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleCreate}
                disabled={!newQuestion.trim()}
                className="flex-1 rounded-full bg-indigo-600 hover:bg-indigo-700 font-bold whitespace-nowrap"
              >
                Log Question
              </Button>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="p-4 flex flex-col gap-6">
          
          {/* Active Questions */}
          <div>
            {activeQuestions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 font-medium text-sm">No active questions right now.</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full flex flex-col gap-3">
                {activeQuestions.map((q) => (
                  <AccordionItem 
                    key={q.id} 
                    value={q.id} 
                    className="bg-white border border-slate-200 shadow-sm rounded-3xl px-5 py-1"
                  >
                    <AccordionTrigger className="hover:no-underline text-left py-4 gap-4 data-[state=open]:border-b data-[state=open]:border-slate-100 data-[state=open]:pb-4">
                      <div className="flex items-start gap-3 w-full">
                         {q.priority === "high" && (
                            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0 animate-pulse border border-white shadow-sm" />
                         )}
                         <span className="font-semibold text-slate-800 leading-snug">{q.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-3">
                       <Textarea
                          placeholder="Doc said..."
                          className="resize-none border-slate-200 rounded-2xl bg-slate-50 focus-visible:ring-indigo-600"
                          defaultValue={q.answer}
                          onChange={(e) => setAnswerDrafts({ ...answerDrafts, [q.id]: e.target.value })}
                        />
                        <div className="flex items-center justify-between mt-4">
                          <button 
                            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                            onClick={() => toggleResolved(q.id, true)}
                          >
                            <Circle size={18} strokeWidth={2} />
                            Mark Resolved
                          </button>
                          
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleUpdateAnswer(q.id, q.answer)}
                            className="rounded-full bg-slate-100 text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 font-bold px-4"
                          >
                            Save Notes
                          </Button>
                        </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          {/* Resolved Section */}
          {resolvedQuestions.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4 mt-2">
                <div className="h-[1px] flex-1 bg-slate-200" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Resolved Log</span>
                <div className="h-[1px] flex-1 bg-slate-200" />
              </div>

              <Accordion type="single" collapsible className="w-full flex flex-col gap-3">
                {resolvedQuestions.map((q) => (
                  <AccordionItem 
                    key={q.id} 
                    value={q.id} 
                    className="bg-white border border-slate-200 shadow-sm rounded-3xl px-5 py-1 opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <AccordionTrigger className="hover:no-underline text-left py-4 gap-4">
                      <div className="flex items-start gap-3 w-full">
                         <div className="text-green-500 mt-0.5 flex-shrink-0">
                           <CheckCircle2 size={20} strokeWidth={2.5} />
                         </div>
                         <span className="font-medium text-slate-600 line-through leading-snug">{q.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-3">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-700 text-sm mb-4 min-h-16">
                          {q.answer || <span className="italic text-slate-400">No notes taken.</span>}
                        </div>
                        <div className="flex items-center justify-end">
                          <button 
                            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors"
                            onClick={() => toggleResolved(q.id, false)}
                          >
                            Re-open Question
                          </button>
                        </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
