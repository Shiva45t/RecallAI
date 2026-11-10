import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Button } from '../ui/Button';
import { Sparkles } from 'lucide-react';

const textSchema = zod.object({
  text: zod.string().min(50, 'Please paste at least 50 characters of study notes to generate cards').max(10000, 'Text is too long. Limit is 10,000 characters.'),
  count: zod.number().min(1).max(20),
});

type TextFormData = zod.infer<typeof textSchema>;

interface TextInputProps {
  onSubmit: (text: string, count: number) => void;
  isLoading: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TextFormData>({
    resolver: zodResolver(textSchema),
    defaultValues: {
      text: '',
      count: 10,
    },
  });

  const selectedCount = watch('count');

  const onFormSubmit = (data: TextFormData) => {
    onSubmit(`Generate flashcards from this text:\n\n${data.text}`, data.count);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Paste Notes, Slides, or Transcript
        </label>
        <textarea
          placeholder="Paste your lecture notes, textbook chapters, or copy-paste slide transcripts here (minimum 50 characters)..."
          rows={6}
          className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white dark:bg-darkSurface text-gray-900 dark:text-gray-105 transition-all outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 dark:placeholder:text-gray-600
            ${errors.text ? 'border-rose-500' : 'border-gray-200 dark:border-gray-800'}`}
          disabled={isLoading}
          {...register('text')}
        />
        {errors.text && (
          <span className="text-xs text-rose-500 font-medium">
            {errors.text.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-305">
          Number of Cards
        </label>
        <div className="flex gap-2">
          {[5, 10, 15, 20].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setValue('count', num)}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl border transition-all active:scale-[0.98] ${
                selectedCount === num
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'bg-white dark:bg-darkSurface border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
              }`}
              disabled={isLoading}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full gap-2 mt-2"
        isLoading={isLoading}
      >
        <Sparkles className="w-4 h-4 text-amber-400 fill-current" /> Generate AI Cards
      </Button>
    </form>
  );
};
