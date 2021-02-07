import { useEffect, useState} from 'react';
import './App.css';
import Header from './components/header';
import Post from './components/post';
import { db } from "./firebase";
import { auth } from "./firebase";
import InstagramEmbed from 'react-instagram-embed';

function App() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  // Effect hook to fetch posts data from firestore
  useEffect(() => {
    db.collection('posts')
    .orderBy('timestamp','desc')
    .onSnapshot(snapshot => {
      setPosts(snapshot.docs.map(doc => ({
        id: doc.id,
        post: doc.data()
      })));
    });
  }, []);

  // Effect hook to authenticate user
  useEffect(() => {
    //listen everytime any authentification change happens
    // if a user logsin/logout/create a user- anytime a chasnge happens, it fires this off.
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
        if(authUser) {
            setUser(authUser);
            //this survives refresh.
            // if you login and refresh, it uses cookie tracking and see that you are still logged in.
            // this is persistent. local state-user is not. this keeps you logged in.

            //Need to raise an event to parent for user updation

        } else {
            // used is logged out
            setUser(null); 
            // onUserChange(user); // sending user prop to parent- App.js
        }
    })
    return () => {
        // if useEffect fires again, perform some clean up actions before you refire
        unsubscribe(); 
    }
},[]) // anytime they change 

  return (
    <div className="App">
      {/* Fixed Header - Logo + Signup/Signin/Logout Button */}
      <Header user={user}/>

      {/* Posts */}
      {/* input includes imgUrl and caption */}
      {/* user includes username and avatar url */}
      <div className="app_posts">
      { 
      posts?.map(({id, post}) => (
        <Post key={id} postId={id} user={user} username={post.username} caption={post.caption} imgUrl={post.imgUrl} />
      ))
      }
      </div>

    {/* <InstagramEmbed
      url='https://www.instagram.com/p/CJUehSwAf6O/'
      maxWidth={320}
      hideCaption={false}
      containerTagName='div'
      protocol=''
      injectScript
      onLoading={() => {}}
      onSuccess={() => {}}
      onAfterRender={() => {}}
      onFailure={() => {}}
    /> */}

    </div>
  );
}

export default App;
