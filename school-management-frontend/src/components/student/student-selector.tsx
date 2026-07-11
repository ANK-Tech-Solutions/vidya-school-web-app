"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import { studentOpsService } from "@/services/student-ops.service";
import type { StudentChild } from "@/types/student-ops";

const storageKey = "vidya-selected-student";

function studentName(student: StudentChild) {
  return student.name || [student.firstName, student.lastName].filter(Boolean).join(" ") || `Student ${student.id}`;
}

export function StudentSelector({ onChange }: { onChange: (studentId?: number) => void }) {
  const [children, setChildren] = useState<StudentChild[]>([]);
  const [selectedId, setSelectedId] = useState<number>();
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    studentOpsService.getChildren()
      .then((items) => {
        setChildren(items);
        if (!items.length) {
          onChangeRef.current(undefined);
          return;
        }

        const storedId = Number(window.localStorage.getItem(storageKey));
        const selected = items.find((item) => item.id === storedId) ?? items[0];
        setSelectedId(selected.id);
        onChangeRef.current(selected.id);
      })
      .catch(() => {
        onChangeRef.current(undefined);
        toast.error("Could not load student accounts");
      });
  }, []);

  if (children.length < 2) return null;

  return <div className="w-full sm:w-64">
    <label htmlFor="student-selector" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Viewing student</label>
    <Select
      id="student-selector"
      value={String(selectedId ?? children[0].id)}
      onChange={(event) => {
        const studentId = Number(event.target.value);
        window.localStorage.setItem(storageKey, String(studentId));
        setSelectedId(studentId);
        onChange(studentId);
      }}
    >
      {children.map((child) => <option key={child.id} value={child.id}>{studentName(child)}{child.grade ? ` · ${child.grade}${child.section ? `-${child.section}` : ""}` : ""}</option>)}
    </Select>
  </div>;
}
