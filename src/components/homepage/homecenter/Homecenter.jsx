import React, { useEffect, useState } from 'react';
import { StoryReel } from './StoryReel';
import './homecenter.css';
import { MessageSender } from './MessageSender';
import { Feed } from './Feed';
import { Box } from '@chakra-ui/react';
import formatTimeFromDatabase from '../../sharedComponents/formatTimeFromDatabase';
import { useUser } from '../../../context/UserContext';
import { asArray, unwrap } from '../../../config/api';
import { http } from '../../../config/http';
import { getUserById, hydratePost, isFriendPair } from '../../../utils/getData';

export const Homecenter = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUser();

  const updatePostInfor = async (userId, post) => {
    try {
      const response = await getUserById(userId);
      if (response?.data) {
        post.profilePic = response.data.avatar;
        post.profileName = response.data.name;
      }
      return post;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return post;
    }
  };

  const updateCommentInfor = async (userId, comment) => {
    try {
      const response = await getUserById(userId);
      if (response?.data) {
        comment.profilePic = response.data.avatar;
        comment.profileName = response.data.name;
      }
      return comment;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return comment;
    }
  };

  const fetchPosts = async () => {
    if (!currentUser?.id) {
      return;
    }
    setLoading(true);
    try {
      const response = await http.get('/post/posts');
      const rawPosts = asArray(unwrap(response)?.posts);
      const visible = [];

      for (const post of rawPosts) {
        const authorId = post.user_id || post.userId;
        const isOwn = authorId === currentUser.id;
        const isFriend = isOwn || (await isFriendPair(currentUser.id, authorId));
        if (!isFriend) {
          continue;
        }
        visible.push(await hydratePost(post, currentUser.id));
      }

      setPosts(visible);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentUser?.id]);

  const updateCommentsForPost = (postId, updatedComments) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, comments: updatedComments } : post
      )
    );
  };

  return (
    <div className="Homecenter">
      <StoryReel />
      <Box mb={'7px'} w={'143%'}>
        <MessageSender
          wid={'100%'}
          setPosts={setPosts}
          currentUserId={currentUser.id}
          setLastPostId={() => {}}
          updatePostInfor={updatePostInfor}
        />
      </Box>

      {posts?.length > 0 ? (
        posts.map((post) => (
          <div key={post.id}>
            <Feed
              postId={post.id}
              profilePic={post?.profilePic}
              content={post?.content}
              timeStamp={formatTimeFromDatabase(post?.timeline)}
              userName={post?.profileName}
              postImage={post?.image}
              likedByCurrentUser={post?.likedByCurrentUser}
              likeCount={post.likeCount || 0}
              commentList={post.comments || []}
              currentUserId={currentUser?.id}
              userCreatePost={post?.user_id}
              setPosts={setPosts}
              posts={posts}
              updateComments={updateCommentsForPost}
              updatePostInfor={updatePostInfor}
              updateCommentInfor={updateCommentInfor}
            />
          </div>
        ))
      ) : (
        <p>{loading ? 'Loading posts...' : 'No posts yet.'}</p>
      )}
    </div>
  );
};
