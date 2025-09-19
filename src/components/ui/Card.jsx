"use client";
import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import Link from "next/link";

export default function ActionAreaCard({ title, image, path, onClick, alt }) {
  const cardContent = (
    <CardActionArea onClick={onClick}>
      <div style={{ backgroundColor: "var(--primary1)", padding: "2rem" }}>
        <CardMedia
          component="img"
          image={image}
          loading="lazy"
          sx={{
            display: "block",
            width: "100px", // adjust as needed
            height: "100px", // adjust as needed
            objectFit: "contain",
            margin: "0 auto",
          }}
          alt={alt || title}
        />
      </div>
      <CardContent>
        <Typography
          gutterBottom
          variant="h5"
          component="div"
          textAlign="center"
        >
          {title}
        </Typography>
      </CardContent>
    </CardActionArea>
  );

  return (
    <Card
      sx={{
        // Smooth animation on hover
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: (theme) => theme.shadows[10],
        },
      }}
    >
      {path ? (
        <Link href={path}>
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </Card>
  );
}
