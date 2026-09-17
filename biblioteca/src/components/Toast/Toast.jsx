import './toast.css'

const Toast = (props) => {
  return (
    <section id='toast' style={props.tipo == 'error' ? {backgroundColor: "#db0000"} : {backgroundColor: "#1dda00"}}>
      <p>{props.message}</p>
    </section>
  )
}

export default Toast
