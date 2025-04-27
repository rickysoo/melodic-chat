import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiKeyModalProps } from "@/types";
import { Eye, EyeOff } from "lucide-react";

export default function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim(), model);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-500 -mx-6 -mt-6 p-6 rounded-t-lg">
          <DialogTitle className="text-white font-heading text-xl">Welcome to Melodic Chat</DialogTitle>
        </div>
        
        <div className="py-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To start chatting with the AI, please enter your OpenAI API key below. Your key will be stored locally in your browser and never sent to our servers.
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Don't have an API key? <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Get one here</a>.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modelSelect">AI Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="modelSelect">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o (Most Capable)</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Balanced)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Skip for Now
          </Button>
          <Button onClick={handleSave} className="bg-primary-600 hover:bg-primary-700">
            Start Chatting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
