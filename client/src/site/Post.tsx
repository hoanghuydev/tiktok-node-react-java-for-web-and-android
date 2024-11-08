import PostService from '@/features/post/postService';
import { PostModel } from '@/models/post';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostInfo from './components/Post/PostInfo';
import { useDispatch, useSelector } from 'react-redux';
import {
  getPostLoadingSelector,
  getPostSelector,
  postSliceSelector,
} from '@/redux/selector';
import { AppDispatch } from '@/redux/store';
import { setPost } from '@/features/post/postSlice';
import PostComment from './components/Post/PostComment';
import CommentForm from './components/Post/CommentForm';
import clsx from 'clsx';
import { commentPost, setComments } from '@/features/comment/commentSlice';
import VideoLarge from '@/components/VideoLarge';
import InputFormEditable from '@/components/InputFormEditable';
import { message } from 'antd';

const Post = () => {
  let { postId } = useParams();
  const parsedPostId = parseInt(postId ?? '0', 10);
  const post = useSelector(getPostSelector);
  const postSlice = useSelector(postSliceSelector);
  const commentFormRef = useRef<HTMLDivElement | null>(null);
  const [paddingBottom, setPaddingBottom] = useState<number>(90);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    const getPostInfoById = async (postId: number) => {
      setPost({} as PostModel);
      const resp = await PostService.getPostById(postId);
      dispatch(setPost(resp.post));
    };
    // Set comments to empty list
    dispatch(setComments([]));
    // Get info post
    getPostInfoById(parsedPostId);
    // Watch post
    PostService.watchPost(parsedPostId);
  }, [parsedPostId]);
  // Update paddingBottom when CommentForm change height
  useEffect(() => {
    const commentFormElement = commentFormRef.current;
    if (!commentFormElement) return;

    const resizeObserver = new ResizeObserver(() => {
      setPaddingBottom(commentFormElement.clientHeight);
    });

    resizeObserver.observe(commentFormElement);

    return () => {
      if (commentFormElement) {
        resizeObserver.unobserve(commentFormElement);
      }
    };
  }, []);
  const handleSubmitComment = async (commentText: string) => {
    if (!commentText.trim()) return;
    try {
      await dispatch(commentPost({ postId: post.id, content: commentText }));
    } catch (error) {
      message.error('Failed to post comment');
    }
  };

  return (
    <div className="h-full">
      {!postSlice?.isLoading && post && (
        <div className="flex h-full">
          {/* First row: video */}
          <VideoLarge post={post} className="flex-[200%] flex bg-black" />

          {/* Second row: post details */}
          <div className="flex-[100%] h-full overflow-hidden relative bg-white flex-col min-w-[290px]">
            <div
              className={clsx('overflow-y-auto h-full post-commnet-side')}
              style={{
                paddingBottom: `${paddingBottom}px`,
              }}
            >
              <PostInfo />
              <PostComment />
            </div>
            <InputFormEditable
              maxCharToShowCountText={24}
              maxCharacters={150}
              handleSubmit={handleSubmitComment}
              placeholder="Add comment..."
              className="min-h-[85px] max-h-[166px] shadow-sm absolute left-0 right-0 bottom-0 border-t-[2px] border-[#e9e9ea]"
            />
          </div>
        </div>
      )}
      {!postSlice?.isLoading && !post && <div>Not found post</div>}
    </div>
  );
};

export default Post;
