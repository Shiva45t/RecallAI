import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { CreateDeckInput } from '../../types/deck.types';

const deckSchema = zod.object({
  title: zod.string().min(3, 'Title must be at least 3 characters').max(50, 'Title cannot exceed 50 characters'),
  description: zod.string().max(150, 'Description cannot exceed 150 characters').optional(),
  subject: zod.string().max(30, 'Subject tag cannot exceed 30 characters').optional(),
  color: zod.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
});

type DeckFormData = zod.infer<typeof deckSchema>;

interface DeckFormProps {
  initialValues?: CreateDeckInput;
  onSubmit: (data: DeckFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const presetColors = [
  '#6366f1', // Indigo
  '#7c3aed', // Violet
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#0ea5e9', // Sky Blue
  '#14b8a6', // Teal
  '#ec4899', // Pink
];

export const DeckForm: React.FC<DeckFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DeckFormData>({
    resolver: zodResolver(deckSchema),
    defaultValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      subject: initialValues?.subject || '',
      color: initialValues?.color || '#6366f1',
    },
  });

  const selectedColor = watch('color');

  const onFormSubmit = async (data: DeckFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      <Input
        label="Deck Title *"
        type="text"
        placeholder="e.g. Organic Chemistry, Algorithms 101"
        error={errors.title?.message}
        {...register('title')}
      />

      <Input
        label="Subject Tag"
        type="text"
        placeholder="e.g. Science, Computer Science"
        error={errors.subject?.message}
        {...register('subject')}
      />

      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          placeholder="Brief summary of what this deck covers..."
          rows={3}
          className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white dark:bg-darkSurface text-gray-900 dark:text-gray-100 transition-all outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 dark:placeholder:text-gray-600
            ${errors.description ? 'border-rose-500' : 'border-gray-200 dark:border-gray-800'}`}
          {...register('description')}
        />
        {errors.description && (
          <span className="text-xs text-rose-500 font-medium">
            {errors.description.message}
          </span>
        )}
      </div>

      {/* Color Accent Picker */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-705 dark:text-gray-300">
          Deck Accent Color
        </label>
        <div className="flex flex-wrap gap-2.5">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className="w-8 h-8 rounded-full border-2 transition-transform active:scale-95"
              style={{
                backgroundColor: color,
                borderColor: selectedColor === color ? '#ffffff' : 'transparent',
                boxShadow: selectedColor === color ? '0 0 0 2px #6366f1' : 'none',
              }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialValues ? 'Save Changes' : 'Create Deck'}
        </Button>
      </div>
    </form>
  );
};
