import {
  ManageAccountsOutlined,
  EditOutlined,
  LocationOnOutlined,
  WorkOutlineOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@mui/icons-material";
import { Box, Typography, Divider, useTheme, IconButton } from "@mui/material";
import Dropzone from "react-dropzone";
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setPosts, setUpdatedUser } from "state";

const UserWidget = ({ userId, picturePath }) => {
  const dispatch = useDispatch();
  const [isEditProfile, setIsEditProfile] = useState(false);
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const { palette } = useTheme();
  const navigate = useNavigate();
  const token = useSelector((state) => state.token);
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;
  const main = palette.neutral.main;

  const getUser = async () => {
    const response = await fetch(
      `https://connectify-wewf.onrender.com/users/${userId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    setUser(data);
  };

  const uploadImage = async (file, timestamp, signature) => {
    const cloudData = new FormData();
    cloudData.append("file", file);
    cloudData.append("timestamp", timestamp);
    cloudData.append("signature", signature);
    cloudData.append("api_key", process.env.REACT_APP_CLOUDINARY_API_KEY);
    cloudData.append("folder", "images");
    try {
      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
      const resourceType = "image";

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        {
          method: "POST",
          body: cloudData,
        }
      );
      const { secure_url } = await res.json();
      return secure_url;
    } catch (err) {
      console.log(err);
    }
  };

  const getSignature = async (folder) => {
    try {
      const res = await fetch(
        `https://connectify-wewf.onrender.com/auth/signature`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ folder: `${folder}` }),
        }
      );
      const data = await res.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditProfileImage = async () => {
    const imageData = new FormData();
    if (image) {
      const { timestamp: imgTimeStamp, signature: imgSignature } =
        await getSignature("images");
      const imgUrl = await uploadImage(image, imgTimeStamp, imgSignature);
      imageData.append("picture", image);
      imageData.append("picturePath", imgUrl);
    }
    const response = await fetch(
      `https://connectify-wewf.onrender.com/users/${userId}/editprofile`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: imageData,
      }
    );

    const { updatedUser, updatedPosts } = await response.json();
    dispatch(setUpdatedUser({ updatedUser }));
    dispatch(setPosts({ posts: updatedPosts }));
    setImage(null);
    setIsEditProfile(false);
  };

  useEffect(() => {
    getUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return null;
  }

  const {
    firstName,
    lastName,
    location,
    occupation,
    viewedProfile,
    impressions,
    friends,
  } = user;

  return (
    <WidgetWrapper>
      {/* FIRST ROW */}
      <FlexBetween gap="0.5rem" pb="1.1rem">
        <FlexBetween gap="1rem" onClick={() => navigate(`/profile/${userId}`)}>
          <UserImage image={picturePath} />
          <Box>
            <Typography
              variant="h4"
              color={dark}
              fontWeight="500"
              sx={{
                "&:hover": {
                  color: palette.primary.light,
                  cursor: "pointer",
                },
              }}
            >
              {firstName} {lastName}
            </Typography>
            <Typography color={medium}>{friends.length} friends</Typography>
          </Box>
        </FlexBetween>
        <ManageAccountsOutlined
          onClick={() => setIsEditProfile(!isEditProfile)}
        />
      </FlexBetween>
      {isEditProfile && (
        <Box border={`1px solid ${medium}`} borderRadius="5px" p="0.5rem">
          <Dropzone
            acceptedFiles=".jpg,.jpeg,.png"
            multiple={false}
            onDrop={(acceptedFiles) => setImage(acceptedFiles[0])}
          >
            {({ getRootProps, getInputProps }) => (
              <FlexBetween>
                <Box
                  {...getRootProps()}
                  border={`2px dashed ${palette.primary.main}`}
                  p="0.4rem"
                  width="100%"
                  sx={{ "&:hover": { cursor: "pointer" } }}
                >
                  <input {...getInputProps()} />
                  {!image ? (
                    <p
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      Update Image
                    </p>
                  ) : (
                    <FlexBetween>
                      <Typography>
                        {image.name.length > 20
                          ? `${image.name.slice(0, 20)}...`
                          : image.name}
                      </Typography>
                      <EditOutlined />
                    </FlexBetween>
                  )}
                </Box>
                {image && (
                  <Box display={"flex"} alignItems={"center"}>
                    <IconButton
                      onClick={() => setImage(null)}
                      sx={{ ml: "5px" }}
                    >
                      <DeleteOutlined sx={{ width: "25px", height: "25px" }} />
                    </IconButton>
                    <IconButton onClick={handleEditProfileImage}>
                      <CheckCircleOutlined
                        sx={{ width: "25px", height: "25px" }}
                      />
                    </IconButton>
                  </Box>
                )}
              </FlexBetween>
            )}
          </Dropzone>
        </Box>
      )}

      <Divider />

      {/* SECOND ROW */}
      <Box p="1rem 0">
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Box display="flex" alignItems="center" gap="1rem">
            <LocationOnOutlined fontSize="large" sx={{ color: main }} />
            <Typography color={medium}>{location}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap="1rem">
            <WorkOutlineOutlined fontSize="large" sx={{ color: main }} />
            <Typography color={medium}>{occupation}</Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* THIRD ROW */}
      <Box p="1rem 0">
        <FlexBetween mb="0.5rem">
          <Typography color={medium}>Who's viewed your profile</Typography>
          <Typography color={main} fontWeight="500">
            {viewedProfile}
          </Typography>
        </FlexBetween>
        <FlexBetween>
          <Typography color={medium}>Impressions of your post</Typography>
          <Typography color={main} fontWeight="500">
            {impressions}
          </Typography>
        </FlexBetween>
      </Box>

      <Divider />

      {/* FOURTH ROW */}
      <Box p="1rem 0">
        <Typography fontSize="1rem" color={main} fontWeight="500" mb="1rem">
          Social Profiles
        </Typography>

        <FlexBetween gap="1rem" mb="0.5rem">
          <FlexBetween gap="1rem">
            <img src="../assets/twitter.png" alt="twitter" />
            <Box>
              <Typography color={main} fontWeight="500">
                Twitter
              </Typography>
              <Typography color={medium}>Social Network</Typography>
            </Box>
          </FlexBetween>
          <EditOutlined sx={{ color: main }} />
        </FlexBetween>

        <FlexBetween gap="1rem">
          <FlexBetween gap="1rem">
            <img src="../assets/linkedin.png" alt="linkedin" />
            <Box>
              <Typography color={main} fontWeight="500">
                Linkedin
              </Typography>
              <Typography color={medium}>Network Platform</Typography>
            </Box>
          </FlexBetween>
          <EditOutlined sx={{ color: main }} />
        </FlexBetween>
      </Box>
    </WidgetWrapper>
  );
};

export default UserWidget;
