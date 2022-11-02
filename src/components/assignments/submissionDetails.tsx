import DOMPurify from 'isomorphic-dompurify'

export interface Submission {
  submitted_at: string
  grade: string
  submission_type: string
  body: string
  attempt: string
}

export default function SubmissionDetail(props: { className?: string; data: Submission }) {
  return (
    <aside className={'bg-zinc-800 rounded w-full p-6 ' + (props.className ? props.className : '')}>
      <h2 className="text-xl">Submission Info</h2>
      <div
        className="prose dark:prose-invert max-w-none pt-6"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(props.data.body),
        }}
      />
    </aside>
  )
}
