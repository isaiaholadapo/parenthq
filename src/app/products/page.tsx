"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProducts, ProductItem } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Trash2, ThumbsUp, ThumbsDown, ExternalLink, PackageCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const { user } = useAuth();
  const { products, loading, addProduct, castVote, updateStatus, deleteProduct } = useProducts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const handleCreate = async () => {
    if (!newTitle.trim() || !user) return;
    const price = parseFloat(newPrice) || 0;
    await addProduct(newTitle.trim(), newUrl.trim(), price, user.uid);
    setNewTitle("");
    setNewUrl("");
    setNewPrice("");
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
        <div className="w-full max-w-md flex flex-col pt-6 px-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-40 bg-slate-200" />
            <Skeleton className="h-10 w-28 rounded-full bg-slate-200" />
          </div>
          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl h-12 mb-4 w-full" />
          <div className="flex flex-col gap-4 pb-12">
            <Skeleton className="h-[140px] w-full rounded-3xl bg-slate-200" />
            <Skeleton className="h-[140px] w-full rounded-3xl bg-slate-200" />
            <Skeleton className="h-[140px] w-full rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  const votingProducts = products.filter((p) => p.status === "Voting");
  const approvedProducts = products.filter((p) => p.status === "Approved");
  const purchasedProducts = products.filter((p) => p.status === "Purchased");

  const ProductList = ({ list, currentTab }: { list: typeof products; currentTab: "Voting" | "Approved" | "Purchased" }) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 mt-4 shadow-sm">
          <p className="text-slate-400 font-medium text-sm">No items in this stage.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 pb-12">
        {list.map((item) => {
          const userVote = user ? item.votes[user.uid] : 0;
          const upvotes = Object.values(item.votes).filter((v) => v === 1).length;
          const isMatch = upvotes >= 2;

          return (
            <Card 
              key={item.id} 
              className={cn(
                "p-4 rounded-3xl flex flex-col gap-4 shadow-sm transition-all duration-300",
                currentTab === "Purchased" ? "border-green-200 bg-green-50/40" : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col pr-4">
                  <span className={cn(
                    "font-bold text-lg leading-tight",
                    currentTab === "Purchased" ? "text-slate-600 line-through decoration-slate-300" : "text-slate-800"
                  )}>
                    {item.title}
                  </span>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="font-extrabold text-slate-700">£{item.price.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
                    {item.url && (
                      <a href={item.url.startsWith('http') ? item.url : `https://${item.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full transition-colors">
                        Link <ExternalLink size={12} strokeWidth={2.5} />
                      </a>
                    )}
                  </div>
                </div>
                {currentTab !== "Purchased" && (
                  <button onClick={() => deleteProduct(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 -mt-2 -mr-2 rounded-full hover:bg-slate-50 flex-shrink-0">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* Action Rows */}
              <div className="flex items-center justify-between mt-1">
                {currentTab === "Voting" && (
                  <>
                    <div className="flex items-center bg-slate-50 rounded-full border border-slate-100 p-1 shadow-inner">
                      <button 
                        onClick={() => user && castVote(item.id, user.uid, 1)}
                        className={cn("p-2 rounded-full transition-all", userVote === 1 ? "bg-indigo-100 text-indigo-700 scale-105 shadow-sm" : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50")}
                      >
                        <ThumbsUp size={18} strokeWidth={userVote === 1 ? 2.5 : 2} />
                      </button>
                      <div className="w-[1px] h-6 bg-slate-200 mx-1" />
                      <button 
                        onClick={() => user && castVote(item.id, user.uid, -1)}
                        className={cn("p-2 rounded-full transition-all", userVote === -1 ? "bg-red-100 text-red-600 scale-105 shadow-sm" : "text-slate-400 hover:text-red-500 hover:bg-red-50")}
                      >
                        <ThumbsDown size={18} strokeWidth={userVote === -1 ? 2.5 : 2} />
                      </button>
                    </div>

                    {isMatch && (
                      <Button onClick={() => updateStatus(item.id, "Approved")} size="sm" className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-bold px-4 shadow-sm animate-in fade-in zoom-in duration-300">
                        Approve
                      </Button>
                    )}
                  </>
                )}

                {currentTab === "Approved" && (
                  <>
                    <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">Approved Match</Badge>
                    <Button onClick={() => updateStatus(item.id, "Purchased")} variant="outline" size="sm" className="rounded-full border-green-500 text-green-700 hover:bg-green-50 hover:text-green-800 font-bold px-4 shadow-sm">
                      <PackageCheck size={16} className="mr-1.5" /> Ordered
                    </Button>
                  </>
                )}

                {currentTab === "Purchased" && (
                  <div className="flex items-center gap-2 w-full justify-between">
                    <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-1 scale-105 pointer-events-none shadow-sm shadow-green-200">
                      <CheckCircle2 size={14} className="mr-1" /> Purchased
                    </Badge>
                    <button onClick={() => deleteProduct(item.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                      <Trash2 size={16} />
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
        
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md pt-6 pb-4 px-4 z-10 border-b border-slate-200 shadow-sm flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gear Pipeline</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            {/* @ts-expect-error asChild is a valid Radix prop but TS fails to resolve it */}
            <DialogTrigger asChild>
              <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-bold shadow-md">
                + Add Gear
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl bg-slate-50">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight text-slate-800">Add Product</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <Input
                  placeholder="Product Name (e.g. Doona)"
                  className="border-slate-200 bg-white rounded-xl focus-visible:ring-indigo-600 h-12 px-5 font-bold"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                  <Input
                    type="number"
                    placeholder="Est. Price"
                    className="border-slate-200 bg-white rounded-xl focus-visible:ring-indigo-600 h-12 pl-8 pr-4 font-bold"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Paste URL (Optional)"
                  className="border-slate-200 bg-white rounded-xl focus-visible:ring-indigo-600 h-12 px-5"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreate} 
                  disabled={!newTitle.trim()} 
                  className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold h-12 text-sm"
                >
                  Submit for Voting
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Tabs */}
        <div className="px-4 pt-4">
          <Tabs defaultValue="Voting" className="w-full">
            <TabsList className="w-full flex bg-slate-200/50 p-1.5 rounded-2xl h-12 overflow-hidden shadow-inner">
              <TabsTrigger value="Voting" className="rounded-xl flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">Voting</TabsTrigger>
              <TabsTrigger value="Approved" className="rounded-xl flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">Approved</TabsTrigger>
              <TabsTrigger value="Purchased" className="rounded-xl flex-1 text-xs font-bold data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border data-[state=active]:border-green-200 data-[state=active]:shadow-sm">Owned</TabsTrigger>
            </TabsList>
            
            <TabsContent value="Voting" className="outline-none">
              <ProductList list={votingProducts} currentTab="Voting" />
            </TabsContent>
            <TabsContent value="Approved" className="outline-none">
              <ProductList list={approvedProducts} currentTab="Approved" />
            </TabsContent>
            <TabsContent value="Purchased" className="outline-none">
              <ProductList list={purchasedProducts} currentTab="Purchased" />
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}
