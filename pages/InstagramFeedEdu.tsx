import React from 'react';

type Story = {
  id: string;
  user: string;
  avatar: string;
};

type Post = {
  id: string;
  user: string;
  location: string;
  avatar: string;
  image: string;
  likes: string;
  caption: string;
  comments: number;
  postedAt: string;
};

const stories: Story[] = [
  { id: 's1', user: 'ana.design', avatar: 'https://i.pravatar.cc/80?img=32' },
  { id: 's2', user: 'pedro.js', avatar: 'https://i.pravatar.cc/80?img=12' },
  { id: 's3', user: 'marina.ui', avatar: 'https://i.pravatar.cc/80?img=47' },
  { id: 's4', user: 'leo.travel', avatar: 'https://i.pravatar.cc/80?img=56' },
  { id: 's5', user: 'bia.photo', avatar: 'https://i.pravatar.cc/80?img=5' },
];

const posts: Post[] = [
  {
    id: 'p1',
    user: 'bia.photo',
    location: 'São Paulo, Brasil',
    avatar: 'https://i.pravatar.cc/80?img=5',
    image: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=900&q=80',
    likes: '1.284 curtidas',
    caption: 'Luz do fim de tarde e café forte.',
    comments: 39,
    postedAt: 'Há 2 horas',
  },
  {
    id: 'p2',
    user: 'leo.travel',
    location: 'Ilhabela, Brasil',
    avatar: 'https://i.pravatar.cc/80?img=56',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    likes: '2.091 curtidas',
    caption: 'Sem filtro. Só mar, vento e paz.',
    comments: 64,
    postedAt: 'Há 5 horas',
  },
];

interface InstagramFeedEduProps {
  onExit?: () => void;
}

const InstagramFeedEdu: React.FC<InstagramFeedEduProps> = ({ onExit }) => {
  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-[470px] pb-20">
        <header className="sticky top-0 z-20 bg-black/90 backdrop-blur px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Feed Clone</h1>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white/60 uppercase">educacional</span>
            {onExit && (
              <button
                onClick={onExit}
                className="text-[11px] uppercase text-primary font-bold"
              >
                Voltar
              </button>
            )}
          </div>
        </header>

        <section className="px-3 py-3 overflow-x-auto no-scrollbar border-b border-white/10">
          <div className="flex gap-3 min-w-max">
            {stories.map((story) => (
              <div key={story.id} className="flex flex-col items-center gap-1 w-16">
                <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500">
                  <img
                    src={story.avatar}
                    alt={story.user}
                    className="w-14 h-14 rounded-full border-2 border-black object-cover"
                  />
                </div>
                <span className="text-[11px] text-white/85 truncate w-full text-center">{story.user}</span>
              </div>
            ))}
          </div>
        </section>

        <main className="space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="border-b border-white/10 pb-4">
              <div className="px-3 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={post.avatar} alt={post.user} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold leading-none">{post.user}</p>
                    <p className="text-xs text-white/60">{post.location}</p>
                  </div>
                </div>
                <span className="material-icons-round text-white/80 text-[20px]">more_horiz</span>
              </div>

              <img src={post.image} alt={post.caption} className="w-full aspect-square object-cover" />

              <div className="px-3 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-[23px]">favorite_border</span>
                    <span className="material-icons-round text-[23px]">chat_bubble_outline</span>
                    <span className="material-icons-round text-[23px]">send</span>
                  </div>
                  <span className="material-icons-round text-[23px]">bookmark_border</span>
                </div>
                <p className="text-sm font-semibold">{post.likes}</p>
                <p className="text-sm">
                  <span className="font-semibold mr-2">{post.user}</span>
                  {post.caption}
                </p>
                <p className="text-sm text-white/55">Ver todos os {post.comments} comentários</p>
                <p className="text-[11px] uppercase text-white/45">{post.postedAt}</p>
              </div>
            </article>
          ))}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-20 bg-black/90 backdrop-blur border-t border-white/10 flex justify-center">
          <div className="w-full max-w-[470px] h-14 px-8 flex items-center justify-between">
            <span className="material-icons-round">home</span>
            <span className="material-icons-round">search</span>
            <span className="material-icons-round">add_box</span>
            <span className="material-icons-round">ondemand_video</span>
            <img src="https://i.pravatar.cc/40?img=15" alt="Perfil" className="w-6 h-6 rounded-full" />
          </div>
        </nav>
      </div>
    </div>
  );
};

export default InstagramFeedEdu;
