import { Avatar, AvatarGroup, IconButton, Spinner, useDisclosure } from '@chakra-ui/react'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import Header from '../../components/header'
import Loader from '../../components/loader'
import { parseDate } from '../../lib/date'
import { getData, getInfiniteData } from '../../lib/fetch'
import { User } from '../../types/api'

interface Conversation {
  id: number
  subject: string
  workflow_state: string
  last_message: string
  participants: User[]
}

export default function Messages() {
  const { data, fetchNextPage, hasNextPage, isSuccess } = useInfiniteQuery(
    ['messages'],
    async ({
      pageParam = `https://apsva.instructure.com/api/v1/conversations?include=participant_avatars`,
    }) => await getInfiniteData<Conversation[]>(pageParam),
    {
      getNextPageParam: (lastPage, _pages) => lastPage.nextParams,
    }
  )

  const [selectedCourse, setCourse] = useState(0)
  const { onOpen, isOpen, onClose } = useDisclosure()

  console.log(isOpen)

  return (
    <div>
      <Header />

      {isSuccess ? (
        <main>
          <InfiniteScroll
            dataLength={data?.pages.flatMap(item => item.data).length}
            next={fetchNextPage}
            hasMore={hasNextPage}
            loader={
              <div className="grid place-content-center">
                <Spinner colorScheme="blue" />
              </div>
            }
            className="p-6 flex flex-col space-y-6"
            endMessage={<p className="text-zinc-500 text-center">End of content</p>}
          >
            {data?.pages
              .flatMap(item => item.data)
              .map(item => (
                <Message
                  data={item}
                  onOpen={() => {
                    console.log(item)
                    setCourse(item.id)
                    onOpen()
                  }}
                  key={item.id}
                />
              ))}
            {isOpen ? <MessageView onClose={onClose} id={selectedCourse} /> : ''}
          </InfiniteScroll>
        </main>
      ) : (
        <Loader />
      )}
    </div>
  )
}

function Message(props: { data: Conversation; onOpen: () => void }) {
  return (
    <article className="p-4 cursor-pointer" onClick={props.onOpen}>
      <div className="flex flex-row">
        <AvatarGroup size="md" max={2}>
          {props.data.participants.map(user => (
            <Avatar src={user.avatar_url} name={user.short_name} key={user.id} />
          ))}
        </AvatarGroup>
        <div className="grid place-content-center pl-3">
          <h2 className="text-lg">{props.data.subject}</h2>
        </div>
      </div>
      <p className="text-zinc-500">{props.data.last_message}</p>
    </article>
  )
}

function MessageView(props: { id: number; onClose: () => void }) {
  const { data, isSuccess } = useQuery(
    ['messages', props.id],
    async () =>
      await getData<{
        participants: User[]
        messages: {
          id: number
          created_at: string
          body: string
          author_id: number
        }[]
      }>(`conversations/${props.id}`)
  )

  if (isSuccess) {
    return (
      <aside className="fixed top-0 right-0 h-screen w-[50vw] bg-zinc-700 border-l border-l-zinc-700 p-6 leading-loose">
        {data.messages.map(message => {
          let author = data.participants.find(user => user.id == message.author_id)

          console.log(author)

          return (
            <div key={message.id}>
              <div className="flex space-x-3">
                <Avatar src={author.avatar_url} />
                <div className="grid grid-flow-col content-center gap-2">
                  <p>{author.name}</p>
                  <p className="text-zinc-500">{author.pronouns}</p>
                </div>
                <div className="flex-grow grid content-center place-items-end">
                  <p className="text-zinc-400">{parseDate(message.created_at)}</p>
                </div>
              </div>
              <hr className="m-3" />
              <p className="text-zinc-300">{message.body}</p>
            </div>
          )
        })}
        <IconButton
          onClick={props.onClose}
          position="absolute"
          top="2"
          right="2"
          aria-label="Close"
          icon={<FontAwesomeIcon icon={faClose} />}
        />
      </aside>
    )
  } else {
    return (
      <aside className="fixed right-0 h-screen top-0 w-[50vw] grid place-content-center bg-zinc-800 border-l border-l-zinc-700">
        <Spinner />
      </aside>
    )
  }
}
