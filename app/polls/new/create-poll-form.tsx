'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useState } from 'react';
import { createPoll } from '@/app/polls/actions';

const initialState = {
  error: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      {pending ? 'Creating Poll...' : 'Create Poll'}
    </button>
  );
}

export default function CreatePollForm() {
  const [state, formAction] = useActionState(createPoll, initialState);
  const [options, setOptions] = useState(['', '']);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700">
          Poll Question
        </label>
        <input
          type="text"
          id="question"
          name="question"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Options</label>
        <div className="mt-2 space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                name="options[]"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-200">
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddOption}
          className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          + Add Option
        </button>
      </div>

      {state?.error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{state.error}</p>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
