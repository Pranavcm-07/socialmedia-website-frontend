import { Box } from "@mui/material";

const UserImage = ({ image, size = "60px" }) => {
  return (
    <Box width={size} height={size}>
      <img
        style={{ objectFit: "cover", borderRadius: "50%" }}
        width={size}
        height={size}
        alt="user"
        src={
          image && image.includes("cloudinary")
            ? `${image}`
            : `https://connectify-wewf.onrender.com/assets/${image}`
        }
      />
    </Box>
  );
};

export default UserImage;
