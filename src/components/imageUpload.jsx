import React, { useState } from 'react';
import { db, storage } from '../firebase';
import firebase from "firebase";
import './imageUpload.css';
import { Button, IconButton, Input, Modal } from '@material-ui/core';
import PostAddIcon from '@material-ui/icons/PostAdd';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import CloseIcon from '@material-ui/icons/Close';

// Progress Bar
// + Input Caption text 
// + Input File uploader 
// + Upload button

function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

const useModalStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    }
}));

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
        display: 'flex',
        '& > * + *': {
            marginLeft: theme.spacing(2),
        },
        },
    }),
);


function ImageUpload({user}) {
    const [caption, setCaption] = useState('');
    const [progress, setProgress] = useState(0);
    const [showProgressBar, setShowProgressBar] = useState(false);
    const [image, setImage] = useState(null);
    const classes = useStyles();
    const modalClasses = useModalStyles();
    const [modalStyle] = useState(getModalStyle) 
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState('');


    const handleFileChange = (event) => {
        // to make sure to pick first file in case of multi selection
        if(event.target.files[0]) {
            setImage(event.target.files[0]);

            // After successful Image selection, open preview Modal.
            setPreviewModalOpen(true);
            // Sets the priview image url.
            var reader = new FileReader();
            reader.onload = function() {
                setPreviewImageUrl(reader.result);
            }
            reader.readAsDataURL(event.target.files[0]);
        }
    };

    const handleUpload = () => {
        // with this, we are uploading the image to the STORAGE.
        const uploadTask = storage.ref(`images/${image.name}`).put(image);
        setShowProgressBar(true);

        uploadTask.on(
            "state_changed", 
            
            // because it will take time to upload. it's a asynchromous process. so we need to show progress to user.
            // This argument is for PROGRESS BAR
            (snapshot) => {
                // All progress bar logic is in here.
                const progress = Math.round(
                    (snapshot.bytesTransferred/snapshot.totalBytes)* 100
                );  // will give a  number b/w 0 to 100.
                setProgress(progress);
            }, 

            // second argument is the error function. to handle error while uploading.
            (error)  => {
                console.log(error);
                alert(error.message);
            },

            //This is the final part. After upload to firebase STORAGE is done.
            () => {
                // all the logic here. 
                // once the upload is completed into the firebase storage, we'll get the download url of the image 
                // and add that url to the database- firestore.
                storage.ref("images").child(image.name)
                .getDownloadURL()
                .then((url) => {
                    db.collection('posts').add({
                        caption : caption,
                        imgUrl : url,
                        username: user.displayName,
                        useremailid: user.email,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    setShowProgressBar(false);
                    setPreviewModalOpen(false);
                    setProgress(0);
                    setImage(null);
                    setCaption('');
                })  
            }
        )
    }

    return(
        <div className="image_upload"> 
            <label htmlFor="image_upload_input">
                <input 
                    style={{display:'none'}}
                    type="file" 
                    accept="image/x-png,image/gif,image/jpeg"
                    onChange={handleFileChange} 
                    id= "image_upload_input"
                />
                <IconButton variant="contained" color="primary" component = "span">
                    <PostAddIcon/>
                </IconButton>
            </label>

             {/* IMAGE PREVIEW MODAL */}
            <Modal 
                open={previewModalOpen} 
                onClose={() => {
                    setPreviewModalOpen(false);
                    setCaption('');
                    setImage(null);
                }}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description">
                <div style= {modalStyle} className={modalClasses.paper}>

                    <div className="preview_modal_header">
                        <h2>Create Post</h2>
                        <IconButton variant="contained" color="primary" 
                        onClick={() => {
                            setPreviewModalOpen(false);
                            setCaption('');
                            setImage(null);
                        }}>
                        <CloseIcon/>
                        </IconButton>
                    </div>

                    <img className="preview_modal_image"
                    src={previewImageUrl} alt=""/>

                    <Input className="preview_modal_caption"
                    type="text" 
                    onChange={event => setCaption(event.target.value)}
                    value={caption}
                    placeholder= "Write a caption..."/>

                {showProgressBar ? (
                    // PROGRESS BAR
                <div className={classes.root}>
                    <CircularProgress className="preview_modal_progress_bar" 
                    variant="determinate" 
                    value={progress} />
                </div>
                ):(
                    // {/* UPLOAD BUTTON. ENABLED ONLY WHEN FILE ARE SELECTED */}
                    <Button className="preview_modal_button" variant="contained" color="primary"
                    disabled= {!image}
                    onClick={handleUpload}>Upload</Button>
                )}
                </div>

            </Modal>
        </div>
    );
}

export default ImageUpload;