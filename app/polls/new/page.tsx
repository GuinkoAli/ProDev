import CreatePollForm  from './create-poll-form';
import { ProtectedRoute } from '@/components/protected-route';

export default function CreatePollPage() {
  return (
    <div className="container mx-auto py-10">
      <ProtectedRoute>
        <CreatePollForm />
      </ProtectedRoute>
    </div>
  );
}
