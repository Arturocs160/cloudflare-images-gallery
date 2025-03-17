"use client";

import styles from "./page.module.css";
import ImageList from "@mui/material/ImageList";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import { Dialog, DialogContent } from "@mui/material";
import ImageListItem from "@mui/material/ImageListItem";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Alert from '@mui/material/Alert';
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [images, setImages] = useState([]);
  const [open, setOpen] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState("");
  const [sizeImage, setSizeImage] = useState("medium");

  const handleChange = (event) => {
    setSizeImage(event.target.value);
  };

  const handleOpen = (imageSrc) => {
    setSelectedImage(imageSrc);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage("");
  };

  useEffect(() => {
    getImages();
  }, []);

  async function getImages() {
    try {
      const result = await axios.get("http://localhost:3001/images");
      // console.log(result.data.result.images);
      setImages(result.data.result.images);
    } catch (error) {
      console.error("Error al obtener las imagenes de cloudflare ", error);
    }
  }

  async function uploadImage(image) {
    try {
      // console.log(image[0]);
      const formData = new FormData();
      formData.append("file", image[0]);
      const result = await axios.post(
        "http://localhost:3001/images/upload",
        formData
      );
      if (result.status === 200) {
        setAlertVisible(true);
        setTimeout(() => {setAlertVisible(false); window.location.reload();}, 2000)
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  }

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.title}>Cloudflare gallery</h2>
      </div>
      {alertVisible && (
        <Alert style={{ marginBottom: 30 }} severity="success">
          Imagen subida correctamente
        </Alert>
      )}
      <div className={styles.button}>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Subir imagen
          <VisuallyHiddenInput
            type="file"
            onChange={(event) => uploadImage(event.target.files)}
          />
        </Button>
      </div>
      <FormControl required style={{ width: "200px" }}>
          <InputLabel id="label">Tamaño imagenes</InputLabel>
          <Select
            labelId="label"
            id="label"
            value={sizeImage}
            label="Tamaño imagenes"
            onChange={handleChange}
          >
            <MenuItem value={"medium"}>500x500</MenuItem>
            <MenuItem value={"public"}>750x750</MenuItem>
          </Select>
        </FormControl>
      <div>
        <ImageList sx={{ width: 1150, height: 850 }} cols={4} gap={10}>
          {images.map((item) => (
            <ImageListItem key={item.id}>
              <img
                src={item.variants.find((variant) => variant.includes("small"))}
                alt={item.id}
                loading="lazy"
                style={{ width: "250px", height: "250px" }}
                onClick={() =>
                  handleOpen(
                    item.variants.find((variant) => variant.includes(sizeImage))
                  )
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
        <Dialog open={open} onClose={handleClose} maxWidth="lg">
          <DialogContent>
            <img
              src={selectedImage ? selectedImage : null}
              alt="Vista ampliada"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
