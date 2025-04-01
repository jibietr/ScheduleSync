import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TemplateCard } from "@/components/templates/template-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, Share2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Templates: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch templates data (using userId=1 for demo)
  const { data: templates, isLoading, error } = useQuery({
    queryKey: ["/api/templates", { userId: 1 }],
    queryFn: async () => {
      const response = await fetch("/api/templates?userId=1");
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json();
    }
  });

  // Fetch user data for the username
  const { data: user } = useQuery({
    queryKey: ["/api/user/1"],
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      return apiRequest("DELETE", `/api/templates/${templateId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template Deleted",
        description: "The meeting template has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (id: number) => {
    // In a real app, this would navigate to the edit page
    // For now, we'll just show a toast
    toast({
      title: "Feature Coming Soon",
      description: "Template editing will be available soon.",
    });
  };

  const handleShare = (id: number) => {
    setSelectedTemplate(id);
    setShareDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Link Copied",
      description: "The booking link has been copied to your clipboard.",
    });
  };

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-medium">Error loading templates</p>
        <p className="text-gray-600 mt-2">Please try refreshing the page</p>
      </div>
    );
  }

  const getTemplateSlug = (id: number) => {
    const template = templates?.find(t => t.id === id);
    return template?.slug || "";
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Meeting Templates</h1>
        <Link href="/create-template">
          <Button>
            <Plus className="mr-1 h-4 w-4" /> New Template
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : templates?.length === 0 ? (
        <div className="text-center py-10 bg-white shadow rounded-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new meeting template.
          </p>
          <div className="mt-6">
            <Link href="/create-template">
              <Button>
                <Plus className="mr-1 h-4 w-4" /> New Template
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template) => (
            <TemplateCard
              key={template.id}
              id={template.id}
              name={template.name}
              description={template.description}
              slug={template.slug}
              duration={template.duration}
              daysOfWeek={template.daysOfWeek}
              startTime={template.startTime}
              endTime={template.endTime}
              timezone={user?.timezone || "America/New_York"}
              username={user?.username || "user"}
              isDefault={template.isDefault}
              onEdit={handleEdit}
              onShare={handleShare}
            />
          ))}
        </div>
      )}

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Meeting Link</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-4">
              Share this link with others to let them book a meeting with you.
            </p>
            <div className="flex items-center space-x-2">
              <Input 
                readOnly 
                value={`${window.location.origin}/${user?.username || "user"}/${getTemplateSlug(selectedTemplate || 0)}`} 
                className="flex-1"
              />
              <Button 
                type="button"
                size="icon"
                onClick={() => copyToClipboard(`${window.location.origin}/${user?.username || "user"}/${getTemplateSlug(selectedTemplate || 0)}`)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Templates;
