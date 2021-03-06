import React, { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'

const Notification = ({ message }) => {
  if(message.text===null) return null
  return(
    <div className={message.reason}>
      {message.text}
    </div>
  )
}
const App = () => {
  const [blogs, setBlogs] = useState([])
  const [notificationMessage, setNotificationMessage] = useState({ text: null, reason: null })
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  let currentUserName
  if (user) currentUserName = user.username
  const blogFormRef= useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const userX = JSON.parse(loggedUserJSON)
      blogService.setToken(userX.token)
      setUser(userX)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const userX = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(userX))
      blogService.setToken(userX.token)
      setUser(userX)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setNotificationMessage({ text: 'wrong username or password', reason:'error' })
      setTimeout(() => {
        setNotificationMessage({ text: null, reason: null })
      }, 5000)
    }
  }
  const handleLogOut = () => {
    window.localStorage.clear()
    setUser(null)
  }
  const addBlog = async (blogObject) => {
    try {
      const blogX = await blogService.create(blogObject)
      blogFormRef.current.toggleVisibility()
      setNotificationMessage({ text: `a new blog ${blogX.title} by ${blogX.author} added`, reason:'success' })
      setTimeout(() => {
        setNotificationMessage({ text: null, reason: null })
      }, 5000)
      setBlogs(blogs.concat(blogX))

    } catch(exception) {
      setNotificationMessage({ text: exception.errorMessage, reason:'error' })
      setTimeout(() => {
        setNotificationMessage({ text: null, reason: null })
      }, 5000)
    }

  }

  const logged = () => (
    <div>
      {user.name} logged in
      <button onClick={handleLogOut}> log out </button>
      <Togglable buttonLabel='create blog' ref={blogFormRef}>
        <BlogForm addBlog={addBlog}/>
      </Togglable>
      {blogs.sort( (first, second) => second.likes - first.likes).map(blog =>
        <Blog key={blog.id} blog={blog} currentUserName={currentUserName} />
      )}
    </div>
  )
  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input type="text" value={username} name='Username'
          onChange={({ target }) => setUsername(target.value)} />
      </div>
      <div>
        password
        <input type="password" value={password} name='Password'
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  )
  return (
    <div>
      <h2>blogs</h2>
      <Notification message={notificationMessage} />
      {user === null && loginForm()}
      {user !== null && logged()}
    </div>
  )
}

export default App