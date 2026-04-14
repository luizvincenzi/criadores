'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { StudentLessonView } from '@/components/education/StudentLessonView';

export default function LessonPage() {
  const params = useParams();
  const lessonId = params?.lessonId as string;
  const courseId = params?.courseId as string;

  if (!lessonId) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-[13px] text-red-700">
          ID da aula inválido.
        </div>
      </div>
    );
  }

  return <StudentLessonView lessonId={lessonId} courseId={courseId} />;
}
