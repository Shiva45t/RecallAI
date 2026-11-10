import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Button } from '../ui/Button';

const cardSchema = zod.object({
  question: zod.string().min(3, 'Question must be at least 3 characters').max(500, 'Question cannot exceed 500 characters'),
  answer: zod.string().min(1, 'Answer is required').max(1000, 'Answer cannot exceed 1000 characters'),
});

type CardFormData = zod.infer<typeof cardSchema>;

interface CardEditorProps {
  initialValues?: { question: string; answer: string };
  onSubmit: (data: CardFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CardEditor: React.FC<CardEditorProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: initialValues || {
      question: '',
      answer: '',
    },
  });

  const onFormSubmit = async (data: CardFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Question *
        </label>
        <textarea
          placeholder="e.g. What is the Big O complexity of Mergesort?"
          rows={3}
          className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white dark:bg-darkSurface text-gray-900 dark:text-gray-105 transition-all outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 dark:placeholder:text-gray-650
            ${errors.question ? 'border-rose-500' : 'border-gray-200 dark:border-gray-800'}`}
          {...register('question')}
        />
        {errors.question && (
          <span className="text-xs text-rose-500 font-medium">
            {errors.question.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-350">
          Answer *
        </label>
        <textarea
          placeholder="e.g. O(n log n) in all cases, because it always splits the list in half and takes linear time to merge."
          rows={4}
          className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white dark:bg-darkSurface text-gray-900 dark:text-gray-105 transition-all outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 dark:placeholder:text-gray-655
            ${errors.answer ? 'border-rose-500' : 'border-gray-200 dark:border-gray-800'}`}
          {...register('answer')}
        />
        {errors.answer && (
          <span className="text-xs text-rose-500 font-medium">
            {errors.answer.message}
          </span>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialValues ? 'Save Changes' : 'Add Card'}
        </Button>
      </div>
    </form>
  );
};
