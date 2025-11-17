import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground" data-testid="heading-settings">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your repository settings
        </p>
      </div>

      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <SettingsIcon className="w-12 h-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground" data-testid="text-placeholder">
              Settings Coming Soon
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Configuration options and preferences will be available here.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
