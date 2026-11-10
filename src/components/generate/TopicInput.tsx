import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Sparkles } from 'lucide-react';

const topicSchema = zod.object({
  topic: zod.string().min(3, 'Topic description must be at least 3 characters').max(100, 'Topic is too long'),
  count: zod.number().min(1).max(20),
});

type TopicFormData = zod.infer<typeof topicSchema>;

interface TopicInputProps {
  onSubmit: (topic: string, count: number) => void;
  isLoading: boolean;
}

export const TopicInput: React.FC<TopicInputProps> = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      topic: '',
      count: 10,
    },
  });

  const selectedCount = watch('count');

  const onFormSubmit = (data: TopicFormData) => {
    onSubmit(`Create study flashcards on the topic: ${data.topic}`, data.count);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      <Input
        label="Enter Study Topic"
        placeholder="e.g. Photosynthesis, Binary Search Trees, French Revolution"
        error={errors.topic?.message}
        disabled={isLoading}
        {...register('topic')}
      />

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
