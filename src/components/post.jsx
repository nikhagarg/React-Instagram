import React, { useEffect, useState } from "react";
import './post.css';
import { Avatar, Button, IconButton, Input, Modal } from "@material-ui/core";
import { db } from "../firebase";
import firebase from "firebase";
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { makeStyles } from '@material-ui/core/styles';

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

function Post({postId, user, username, caption,  imgUrl}) {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');
    const modalClasses = useModalStyles();
    const [modalStyle] = useState(getModalStyle); 
    const [optionsModalOpen, setOptionsModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editCaption, setEditCaption] = useState(caption);

    useEffect(() => {
        let unsubscribe;
        if(postId) {
            unsubscribe = db
            .collection('posts')
            .doc(postId)
            .collection('comments').orderBy('timestamp','asc')
            .onSnapshot((snapshot) => {
                setComments(snapshot.docs.map(doc => doc.data()));
            });
        }
        return () => {
            unsubscribe();
        };
    }, [postId]);

    const handlePostComment= (event) => {
        event.preventDefault();
        db.collection("posts").doc(postId)
        .collection('comments').add({
            text: comment,
            username: user.displayName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        setComment('');
    }

    const handlePostDelete = () => {
        db.collection('posts').doc(postId).delete();
        setOptionsModalOpen(false);
    }

    const handleEditClicked = () => {
        setOptionsModalOpen(false);
        setEditModalOpen(true);
    }

    const handleEditDone = () => {
        setEditModalOpen(false);
        db.collection('posts').doc(postId).set({
            'caption': editCaption,
        }, {merge: true});
    }



    return(
        <div className="post">
            <div className="post_header">
                <div className="post_header_info">
                    <Avatar className="post_avatar"
                    alt={username} 
                    src="/static/images/avatar/1.jpg" />
                    <h2>{username}</h2>
                </div>
                {user && user.displayName === username &&
                    <div>
                        <IconButton onClick={() => setOptionsModalOpen(true)}>
                            <MoreHorizIcon/>
                        </IconButton>
                    </div>
                }
                
            </div>
            
            {/* // name + avatar
            // Image
            // username + caption
            // Comments */}
            <img className= "post_image"
                src= {imgUrl}
                alt = ""
            />

            <div className="post_footer">
            <p><span><strong>{username} </strong></span>{caption}</p>

            <div className="post_comments">
            {comments.map(comment => (
                <p><span><strong>{comment.username} </strong></span>{comment.text}</p>
            ))}
            </div>    

             {/* ADD A COMMENT */}
            {user && (
                <form className="post_comment_section">
                <Input 
                className="comment_input"
                type="text"
                value={comment}
                placeholder="Add a comment.."
                onChange={event => setComment(event.target.value)}/>
                <Button className="comment_button" color="primary"
                type="submit" 
                disabled={!comment}
                onClick={handlePostComment}>Post</Button>
                </form>
            )}
            </div>

            {/* MODAL FOR EDITING POST */}
            <Modal 
                open = {optionsModalOpen || editModalOpen}
                onClose={() => {
                    setOptionsModalOpen(false);
                    setEditModalOpen(false);
                }}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description">
                    {editModalOpen ? (
                        <div style= {modalStyle} className={`${modalClasses.paper}`}>
                            <div className="edit_modal_header">
                                <Button color="default" variant="contained" onClick={() => {
                                    setEditCaption(caption);
                                    setEditModalOpen(false);
                                    setOptionsModalOpen(false);
                                }}>Cancel</Button>
                                <h3>Edit</h3>
                                <Button color="primary" variant="contained" onClick={handleEditDone}>Done</Button>
                            </div>

                            <img className="edit_modal_image"
                            src={imgUrl} alt=""/>
                            <Input className="edit_modal_caption"
                            type="text" 
                            onChange={event => setEditCaption(event.target.value)}
                            value={editCaption}
                            placeholder= {caption}/>
                        </div>
                    ):(
                        <div style= {modalStyle} className={`${modalClasses.paper} post_options_modal`}>
                            <Button color="default" onClick={handleEditClicked}>
                                Edit
                            </Button>
                            <Button onClick = {handlePostDelete}>
                                Delete
                            </Button>
                        </div>
                        )
                    }

                

            </Modal>

        </div>
    );
}

export default Post;