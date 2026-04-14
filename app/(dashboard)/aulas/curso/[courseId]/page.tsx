'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { StudentCourseView } from '@/components/education/StudentCourseView';

export default function StudentCoursePage() {
  const params = useParams();
  const courseId = params?.courseId as string;

  if (!courseId) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 pt-[80px] md:pt-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-[13px] text-red-700">
          ID do curso inválido.
        </div>
      </div>
    );
  }

  return <StudentCourseView courseId={courseId} />;
}
