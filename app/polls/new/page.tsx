import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPollPage() {
  return (
    <div className="mx-auto max-w-2xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create a new poll</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input id="question" placeholder="What should we vote on?" />
            </div>
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                <Input placeholder="Option 1" />
                <Input placeholder="Option 2" />
              </div>
            </div>
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


