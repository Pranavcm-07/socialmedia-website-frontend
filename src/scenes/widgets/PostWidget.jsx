import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  DeleteOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  Typography,
  useTheme,
  TextField,
  Button,
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import UserImage from "components/UserImage";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDeletePost, setPost } from "state";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments,
  search,
  createdAt,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [userComment, setUserComment] = useState("");
  const user = useSelector((state) => state.user);
  const [loadedComments, setLoadedComments] = useState(comments);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;
  const isMatch =
    name.toLowerCase().includes(search.toLowerCase()) ||
    description.toLowerCase().includes(search.toLowerCase());

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const patchLike = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };
  const handleComment = async () => {
    const response = await fetch(
      `http://localhost:3001/posts/${postId}/comments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: loggedInUserId,
          userPicturePath: user.picturePath,
          comment: userComment,
          firstName: user.firstName,
          lastName: user.lastName,
        }),
      }
    );
    const postComment = await response.json();
    setUserComment("");
    setLoadedComments(postComment);
  };
  const handleDelete = async () => {
    const response = await fetch(
      `http://localhost:3001/posts/${postId}/delete`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      }
    );
    const data = await response.json();
    dispatch(setDeletePost({ post: data }));
  };
  useEffect(() => {
    const getComments = async () => {
      const response = await fetch(
        `http://localhost:3001/posts/${postId}/get/comments`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const getComment = await response.json();
      setLoadedComments(getComment);
    };
    getComments();
  }, [postId, token, comments]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    isMatch && (
      <WidgetWrapper m="2rem 0">
        <Friend
          friendId={postUserId}
          name={name}
          subtitle={location}
          userPicturePath={userPicturePath}
          createdAt={createdAt}
          isPost
        />
        <Typography color={main} sx={{ mt: "1rem", pl: "10px" }}>
          {description}
        </Typography>
        {picturePath && (
          <img
            width="100%"
            height="auto"
            alt="post"
            style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
            src={`http://localhost:3001/assets/${picturePath}`}
          />
        )}
        <FlexBetween mt="0.25rem">
          <FlexBetween gap="1rem">
            <FlexBetween gap="0.3rem">
              <IconButton onClick={patchLike}>
                {isLiked ? (
                  <FavoriteOutlined sx={{ color: primary }} />
                ) : (
                  <FavoriteBorderOutlined />
                )}
              </IconButton>
              <Typography>{likeCount}</Typography>
            </FlexBetween>

            <FlexBetween gap="0.3rem">
              <IconButton onClick={() => setIsComments(!isComments)}>
                <ChatBubbleOutlineOutlined />
              </IconButton>
              <Typography>{loadedComments.comments?.length}</Typography>
            </FlexBetween>
            <IconButton onClick={handleDelete}>
              <DeleteOutlined />
            </IconButton>
          </FlexBetween>

          <IconButton>
            <ShareOutlined />
          </IconButton>
        </FlexBetween>
        {isComments && (
          <Box mt="0.5rem">
            <FlexBetween sx={{ mt: "1rem", mb: "1rem" }}>
              <TextField
                id="my-text-field"
                label=""
                name="userComment"
                variant="outlined"
                placeholder="Add your Comment"
                size="small"
                value={userComment}
                sx={{ p: "5 rem", width: "85%", mt: "1 rem" }}
                onChange={(e) => {
                  setUserComment(e.target.value);
                }}
              />
              <Button
                disabled={!userComment}
                onClick={handleComment}
                sx={{
                  color: palette.background.alt,
                  backgroundColor: palette.primary.main,
                  borderRadius: "3rem",
                  "&:hover": {
                    backgroundColor: palette.primary.light,
                  },
                }}
              >
                Post
              </Button>
            </FlexBetween>
            <Divider />
            {loadedComments.comments
              ?.map((userComment, i) => (
                <Box key={`${name}-${i}`}>
                  <Divider />
                  <Box display={"flex"} alignItems={"center"}>
                    <UserImage
                      image={userComment.userPicturePath}
                      size="20px"
                    />
                    <Typography
                      sx={{
                        color: palette.neutral.mediumMain,
                        m: "0.5rem 0",
                        pl: "0.5rem",
                      }}
                    >
                      {userComment.firstName} {userComment.lastName}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: main, m: "0 0 0.2rem 1.6rem" }}>
                    {userComment.comment}
                  </Typography>
                </Box>
              ))
              .reverse()}
          </Box>
        )}
      </WidgetWrapper>
    )
  );
};

export default PostWidget;
