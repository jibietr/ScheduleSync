import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { TemplateForm } from "@/components/templates/template-form";
import { useToast } from "@/hooks/use-toast";

const CreateTemplate: React.FC = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch current user to get userId (using userId=1 for demo)
  const { data: user } = useQuery({
    queryKey: ["/api/user/1"],
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      return apiRequest("POST", "/api/templates", {
        ...templateData,
        userId: user?.id || 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template Created",
        description: "Your meeting template has been created successfully.",
      });
      navigate("/templates");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create template. Please check your inputs and try again.",
        variant: "destructive",
      });
      console.error("Template creation error:", error);
    },
  });

  const handleSubmit = (values: any) => {
    createTemplateMutation.mutate(values);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Meeting Template</h1>
      </div>
      
      <TemplateForm 
        onSubmit={handleSubmit}
        isLoading={createTemplateMutation.isPending}
      />
    </div>
  );
};

export default CreateTemplate;
