import { Submission } from './components/assignments/submissionDetails'

export interface DashboardCourse {
  image: string
  courseCode: string
  shortName: string
  id: number
  defaultView: DefaultView
  assetString: string
}

export interface Course {
  course_code: string
  name: string
  id: number
  default_view: DefaultView
  syllabus_body: string
}

export type DefaultView = 'feed' | 'wiki' | 'modules' | 'assignments' | 'syllabus'

export interface User {
  avatar_url: string
  short_name: string
  pronouns: string
  id: number
  name: string
}

export interface Unread {
  unread_count: string
}

export interface Tab {
  html_url: string
  id: string
  label: string
  type: 'external' | 'internal'
  hidden: boolean
  visibility: 'public' | 'members' | 'admins' | 'none'
  position: number
}

export interface Page {
  page_id: number
  title: string
  body: string
  created_at: string
  updated_at: string
}

export interface Module {
  id: number
  name: string
  items: Item[]
  position: number
}

export interface Item {
  id: number
  content_id: number
  indent: number
  title: string
  type: Type
  external_url: string
  page_url: string
  content_details: { completed: boolean; due_at: string; locked: boolean }
}

export interface Announcement {
  id: number
  title: string
  message: string
  posted_at: string
  delayed_post_at: string | null
}

export type Type =
  | 'File'
  | 'Page'
  | 'Discussion'
  | 'Assignment'
  | 'Quiz'
  | 'SubHeader'
  | 'ExternalUrl'
  | 'ExternalTool'

export interface Assignment {
  id: number
  name: string
  description: string
  created_at: string
  due_at: string
  submission_types: SubmissionType[]
  has_submitted_submissions: boolean
  external_tool_tag_attributes: {
    url: string
  }
  submission: Submission
}

export type SubmissionType =
  | 'discussion_topic'
  | 'online_quiz'
  | 'on_paper'
  | 'none'
  | 'external_tool'
  | 'online_text_entry'
  | 'online_url'
  | 'online_upload'
  | 'media_recording'
  | 'student_annotation'

export type LinkType =
  | 'Assignment'
  | 'Discussion'
  | 'Page'
  | 'File'
  | 'Folder'
  | 'Quiz'
  | 'Module'
  | 'SessionlessLaunchUrl'

export interface File {
  id: string
  created_at: string
  updated_at: string
  display_name: string
  url: string
  'content-type': string
  filename: string
}

export interface Discussion {
  id: number
  title: string
  message: string
  posted_at: string
  last_reply_at: string
  require_initial_post: boolean
  user_can_see_posts: boolean
  subscribed: boolean
  delayed_post_at: string | null
  lock_at: null
  locked: false
  lock_explanation: 'This discussion is locked until September 1 at 12:00am'
  user_name: 'User Name'
}
