import { useState } from "react"
import {useAuth} from '../../contexts/AuthContext'
import { useNavigate } from "react-router-dom"
import Toast from '../../components/Toast/Toast'
import logo from '../../assets/logo-bg.png'
import './login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')

  const {login} = useAuth()
  const navigate = useNavigate()

  const fazerLogin = async (e) => {
    e.preventDefault()
    try {
      setError('')

      await login(email,senha)

      navigate('/')
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <main id="login">
      <section className="box-info">
        <div>
          <img src={logo} alt="Logo" />
        </div>
        <p>Acesso autorizado somente a funcionarios</p>
      </section>
      <section className="box-form">
        <h2>Fazer Login</h2>
        <p>Insira seus dados para acessar a plataforma</p>
        <form onSubmit={fazerLogin}>
          <div className="label-input">
            <label htmlFor="email">Email</label>
            <input type="email" aria-label="input-login" placeholder="Digite seu email" onChange={(e) => setEmail(e.target.value)}/>
          </div>
          <div className="label-input">
            <label htmlFor="senha">Senha</label>
            <input type="password" aria-label="input-login" placeholder="Digite sua senha" onChange={(e) => setSenha(e.target.value)}/>
          </div>
          <button aria-label="fazer login" type="submit">FAZER LOGIN</button>
        </form>
      </section>
      {error ? <Toast tipo="error" message={error}/> : null}
    </main>
  )
}

export default Login
