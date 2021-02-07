import React, { useState } from "react";
import './header.css';
import { Button, IconButton, Input, makeStyles, Modal, Avatar } from "@material-ui/core";
import { auth } from "../firebase";
import ImageUpload from "./imageUpload";
import HomeIcon from '@material-ui/icons/Home';

function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

const useStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    }
}));


function Header({user}) {
    const [signupModalopen, setSignupModalopen] = useState(false);
    const [signinModalOpen, setSigninModalopen] = useState(false);
    const classes = useStyles();
    const [modalStyle] = useState(getModalStyle) 
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // const [user, setUser] = useState(null);

    const handleSignup = (event) => {
        event.preventDefault(); // stops default page refreshing

        auth.createUserWithEmailAndPassword(email,password)
        .then((authUser) => {
            return authUser.user.updateProfile({
                displayName: username
            })
        })
        .catch((error) => alert(error.message));
        setSignupModalopen(false);

    }

    const handleSignin = (event) => {
        event.preventDefault(); // stops default page refreshing

        auth.signInWithEmailAndPassword(email, password)
        .catch((error) => alert(error.message))
        setSigninModalopen(false);
    }

    const instaLogo = (
        <img className="app_header_img"
            src="https://www.instagram.com/static/images/web/mobile_nav_type_logo-2x.png/1b47f9d0e595.png"
            alt ="Instagram"
        />
    )

    return(
        <>
        <div className="app_header">
            {instaLogo}

            {/* SIGN UP or LOGOUT BUTTON */}
            <div className="header_button">
                {user ? (
                <div className= "header_login_container">
                    <IconButton onClick={() => window.location.reload()}>
                        <HomeIcon/>
                    </IconButton>
                    <ImageUpload user={user}/>
                    <Avatar id="header_avatar"
                    alt={user.displayName} 
                    src="/static/images/avatar/1.jpg" />
                    <Button onClick={event => auth.signOut()}>Log Out</Button>        
                </div>
                    ):(
                <div className= "header_login_container">
                    <Button onClick={event => setSignupModalopen(true)}>Sign up</Button>
                    <Button onClick={event => setSigninModalopen(true)}>Sign in</Button>
                </div>    
                
                )}
            </div>   
        </div>

        {/* SIGNUP/SIGNIN MODAL */}
        <Modal 
        open={signupModalopen || signinModalOpen} 
        onClose={() => {
            setSignupModalopen(false);
            setSigninModalopen(false); }} 
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description">
            <div style= {modalStyle} className={classes.paper}>
                <form className="header_modal">
                    {instaLogo}
                    {/* SHOW USERNAME FIELD ONLY IF SIGNUP IS CLICKED */}
                    {signupModalopen && (<Input
                    placeholder= "username"
                    type="text"
                    value={username}
                    onChange= {event => setUsername(event.target.value)}
                    />)}
                    
                    <Input
                    placeholder= "email"
                    type="email"
                    value={email}
                    onChange= {event => setEmail(event.target.value)}
                    />
                    <Input
                    placeholder= "password"
                    type="password"
                    value={password}
                    onChange= {event => setPassword(event.target.value)}
                    />

                    {signupModalopen ?  (
                    <Button color="primary" type="submit" onClick={handleSignup}>Sign Up</Button>
                    ):(
                    <Button color="primary" type="submit" onClick={handleSignin}>Sign In</Button>
                    )}
                </form>
                
            </div>
        </Modal>

        </>
    );
}

export default Header;
