import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { StoryReel } from "./StoryReel";
import "./homecenter.css";
import { MessageSender } from "./MessageSender";
import { Feed } from "./Feed";
import { Box } from "@chakra-ui/react";
import formatTimeFromDatabase from "../../sharedComponents/formatTimeFromDatabase";
import { useUser } from "../../../context/UserContext";
import { getFriendByUserId1AndUserId2, getUserById } from "../../../utils/getData";
import { addDays } from "date-fns";

export const Homecenter = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUser(); // id current user 
  const postsPerPage = 3; // Number of posts to fetch at once
  const [lastPostId, setLastPostId] = useState(null);
  // const [hasMore, setHasMore] = useState(true); // Track if there are more posts
  const updatePostInfor = async (userId, post) => {
    try {
      const response = await getUserById(userId);
      if (response && response?.data) {
        post.profilePic = response?.data.avt;
        post.profileName = response?.data.name;
      } else {
        console.error('Error: response or response.data is undefined');
        // // Handle the case where response or response.data is missing
        // post.profilePic = 'https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp'; // Or some default value
        // post.profileName = 'Anonymous'; // Or some default name
      }
      if (post.comments.$values.length && Array.isArray(post.comments.$values)) {
        const updatedComments = await Promise.all(
          post.comments.$values.map(async (comment) => {
            return await updateCommentInfor(comment.userId, comment);
          })
        );
        post.comments.$value = updatedComments;
      }
      return post;
    } catch (error) {
      console.error('Error fetching user data:', error);
      // // Handle the error (e.g., return default values or an empty object)
      // post.profilePic = "https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp';
      // post.profileName = 'Anonymous';
      return post;
    }
  };

  const updateCommentInfor = async (userId, comment) => {
    try {
      const response = await getUserById(userId);
      if (response && response?.data) {
        comment.profilePic = response?.data.avt;
        comment.profileName = response?.data.name;
      } else {
        console.error('Error: response or response.data is undefined');
        // // Handle the case where response or response.data is missing
        // post.profilePic = 'https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp'; // Or some default value
        // post.profileName = 'Anonymous'; // Or some default name
      }

      return comment;
    } catch (error) {
      console.error('Error fetching user data:', error);
      // // Handle the error (e.g., return default values or an empty object)
      // post.profilePic = "https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp';
      // post.profileName = 'Anonymous';
      return comment;
    }
  };

  const fetchPosts = async () => {
    // if (loading || !hasMore) return; // Prevent fetch if already loading or no more posts
    setLoading(true);
    try {
      const url = lastPostId
        ? `${process.env.REACT_APP_API_URL}/post/${currentUser}?lastPostId=${lastPostId}&limit=${postsPerPage}`
        : `${process.env.REACT_APP_API_URL}/post/${currentUser}?limit=${postsPerPage}`;
      const response = await axios.get(url);
      if (response?.data?.$values?.length) {
        const fetchedPosts = [];

        for (const post of response?.data.$values) {
          const resGetReq3 = await getFriendByUserId1AndUserId2(currentUser, post.userId);
          if (resGetReq3 !== null || post.userId === currentUser) {
            // Nếu là bạn bè, cập nhật thông tin bài viết
            const updatedPost = await updatePostInfor(post.userId, post);
            fetchedPosts.push(updatedPost);
          }
        }
        const uniquePosts = fetchedPosts.filter(
          (newPost) => !posts.some((existingPost) => existingPost.id === newPost.id)
        );
        console.log("day la uni", response?.data);
        console.log("day la fetch", fetchedPosts);
        setLastPostId(response?.data.$values[response?.data.$values.length - 1].id);
        setPosts((prevPosts) => [...prevPosts, ...uniquePosts]);

        // Check if fewer posts than expected are fetched, indicating no more posts
        // if (fetchedPosts.length < postsPerPage) {
        //   setHasMore(false); // No more posts to load
        // }
      } else {
        console.error("Unexpected response format:", response?.data);
        setPosts((prevPosts) => [...prevPosts]);
        // setHasMore(false); // No posts in the response
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of posts
  useEffect(() => {
    console.log("day la load tu effect", lastPostId)
    fetchPosts();
  }, []);

  // Update comments for a specific post
  const updateCommentsForPost = (postId, updatedComments) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, comments: { $values: updatedComments } } : post
      )
    );
  };
  // Handle scrolling to load more posts
  const handleScroll = useCallback(() => {
    const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
    if (bottom && !loading) {
      fetchPosts();
    }
  }, [lastPostId, loading]);
  // // Add event listener for scrolling
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="Homecenter">
      <StoryReel />
      <Box mb={"7px"} w={"143%"}>
        <MessageSender wid={"100%"} setPosts={setPosts} currentUserId={currentUser} setLastPostId={setLastPostId} updatePostInfor={updatePostInfor} />
      </Box>


      {posts?.length > 0 ? (
        posts.map((post) => (
          <div key={post.id}>
            <Feed
              postId={post.id}
              profilePic={post.profilePic}
              content={post.content}
              timeStamp={formatTimeFromDatabase(post.timeline)}
              userName={post.profileName}
              postImage={post.image}
              likedByCurrentUser={post.likedByCurrentUser}
              likeCount={post.reactions.$values.length}
              commentList={post.comments.$values}
              currentUserId={currentUser}
              userCreatePost={post.userId}
              setPosts={setPosts}
              posts={posts}
              updateComments={updateCommentsForPost}
              updatePostInfor={updatePostInfor}
              updateCommentInfor={updateCommentInfor}
            // userId={post?.userId}
            />
          </div>
        ))
      ) : (
        <p>Loading posts...</p>
      )}
      {/* {loading && <p>Loading more posts...</p>} */}
    </div>
  );
};
