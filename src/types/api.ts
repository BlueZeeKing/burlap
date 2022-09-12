export interface DashboardCourse {
  image: string;
  courseCode: string;
  shortName: string;
  id: number;
  defaultView: DefaultView;
}

export interface Course {
  course_code: string;
  name: string;
  id: number;
  default_view: DefaultView;
  syllabus_body: string;
}

export type DefaultView = "feed" | "wiki" | "modules" | "assignments" | "syllabus";

export interface User {
  avatar_url: string;
  short_name: string;
  pronouns: string;
  id: number;
}

export interface Unread {
  unread_count: string;
}

export interface Tab {
  html_url: string;
  id: string;
  label: string;
  type: "external" | "internal";
  hidden: boolean;
  visibility: "public" | "members" | "admins" | "none";
  position: number;
}

export interface Page {
  page_id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: number;
  name: string;
  items: Item[];
  position: number;
}

export interface Item {
  id: number;
  content_id: number;
  indent: number;
  title: string;
  type: Type;
  external_url: string;
  page_url: string;
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  posted_at: string;
  delayed_post_at: string | null;
}

export type Type =
  | "File"
  | "Page"
  | "Discussion"
  | "Assignment"
  | "Quiz"
  | "SubHeader"
  | "ExternalUrl"
  | "ExternalTool";

export interface Assignment {
  id: number;
  name: string;
  description: string;
  created_at: string;
  due_at: string;
  submission_types: SubmissionType[];
  has_submitted_submissions: boolean;
}

export type SubmissionType =
  | "discussion_topic"
  | "online_quiz"
  | "on_paper"
  | "none"
  | "external_tool"
  | "online_text_entry"
  | "online_url"
  | "online_upload"
  | "media_recording"
  | "student_annotation";