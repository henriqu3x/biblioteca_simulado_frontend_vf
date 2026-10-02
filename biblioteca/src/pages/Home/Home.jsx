import { useEffect, useState } from 'react'
import './home.css'
import api from '../../services/api'
import {useAuth} from '../../contexts/AuthContext'
import Toast from '../../components/Toast/Toast'
import Modal from '../../components/Modal/Modal'
import dataConvertida from '../../services/dataConvertida'
import logo from '../../assets/logo-bg.png'

const Home = () => {
  const {user,isAdmin,logout} = useAuth()

  const [usuarios, setUsuarios] = useState([])
  const [autores, setAutores] = useState([])
  const [categorias, setCategorias] = useState([])
  const [livros, setLivros] = useState([])
  const [exemplares, setExemplares] = useState([])
  const [emprestimos, setEmprestimos] = useState([])
  const [devolucoes, setDevolucoes] = useState([])

  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  
  const [tab, setTab] = useState('usuarios')

  const [modal,setModal] = useState({open: false, mode: 'add', register: null})

  //FILTROS
  const exemplaresAtivos = exemplares.filter((e) => e.ativo)
  const livrosAtivos = livros.filter((e) => e.ativo)
  const categoriasAtivos = categorias.filter((e) => e.ativo)
  const autoresAtivos = autores.filter((e) => e.ativo)
  const clientesAtivos = usuarios.filter((e) => e.ativo && e.perfil == 'cliente')
  const emprestimosAtivos = emprestimos.filter((e) => e.emprestimo.status == 'em aberto' || e.emprestimo.status == 'em atraso')

  const disponiveis = exemplares.filter((e) => e.ativo && e.status == 'disponivel')
  const emprestados = exemplares.filter((e) => e.ativo && e.status == 'emprestado')

  const [inputBuscaLivro, setInputBuscaLivro] = useState('')
  const livrosFiltrados = livros.filter((e) => (!inputBuscaLivro || e.livro.titulo.includes(inputBuscaLivro) || e.autor.nome.includes(inputBuscaLivro) || e.livro.categoria.nome.includes(inputBuscaLivro)))

  const [exemplarStatus, setExemplarStatus] = useState('')
  const exemplarFiltrado = exemplares.filter((e) => (!exemplarStatus || e.status == exemplarStatus))

  const [usuarioEmprestimo, setUsuarioEmprestimo] = useState('')
  const [emprestimosStatus, setEmprestimosStatus] = useState('')
  const emprestimosFiltrados = emprestimos.filter((e) => (!emprestimosStatus || e.emprestimo.status == emprestimosStatus) && (!usuarioEmprestimo || e.emprestimo.usuario_id == usuarioEmprestimo))

  //PAGINAÇÃO
  const obterListaAtual = () => {
  switch (tab) {
    case 'usuarios': return usuarios
    case 'autores': return autores
    case 'categorias': return categorias
    case 'livros': return livrosFiltrados
    case 'exemplares': return exemplarFiltrado
    case 'emprestimos': return emprestimosFiltrados
    case 'devolucoes': return devolucoes
    default: return []
  }
}
  const listaAtual = obterListaAtual()
  const [paginaAtual, setPaginaAtual] = useState(1)
  const itensPorPagina = 5

  const paginar = (lista) => {
    const inicio = (paginaAtual - 1) * itensPorPagina
    const fim = inicio + itensPorPagina

    return lista.slice(inicio, fim)
  }


  const buscarApi = async () => {
    try {
      setError('')
      
      const users = await api.get('/usuarios')
      const autors = await api.get('/autores')
      const categories = await api.get('/categorias')
      const books = await api.get('/livros')
      const exemplers = await api.get('/exemplares')
      const empres = await api.get('/emprestimos')
      const devos = await api.get('/devolucoes')

      setUsuarios(users.data)
      setAutores(autors.data)
      setCategorias(categories.data)
      setLivros(books.data)
      setExemplares(exemplers.data)
      setEmprestimos(empres.data)
      setDevolucoes(devos.data)
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message
      setError(message)
    }
  }

  useEffect(()=>{
    buscarApi()
  },[])

  const enviarFormulario = async (dadosFormulario) => {
    try {
      setError('')
      setMsg('')

      let result;
      if (modal.mode == 'att') {
        result = await api.put(`/${tab}/${modal.register?.id}`, dadosFormulario)
      } else {
        result = await api.post(`/${tab}`, dadosFormulario)
      }

      setMsg(result.data.message)

      const settersPorTab = {
        usuarios: setUsuarios,
        autores: setAutores,
        categorias: setCategorias,
        livros: setLivros,
        exemplares: setExemplares,
        emprestimos: setEmprestimos,
        devolucoes: setDevolucoes
      }

      const setEntidade = settersPorTab[tab]
      const entidadeSalva = result.data.result

      if (modal.mode == 'att') {
        setEntidade((entidades) => entidades.map((e) => e.id == entidadeSalva.id ? entidadeSalva : e))
      } else {
        setEntidade((entidades) => [...entidades, entidadeSalva])
      }

      setModal({open: false, mode: 'add', register: null})

      buscarApi()
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message
      setError(message)
    }
  }

  const alterarAtivo = async (id) => {
    try {
      setError('')
      setMsg('')

      const result = await api.patch(`/${tab}/${id}`)

      setMsg(result.data.message)

      const settersPorTab = {
        usuarios: setUsuarios,
        autores: setAutores,
        categorias: setCategorias,
        livros: setLivros,
        exemplares: setExemplares,
        emprestimos: setEmprestimos,
        devolucoes: setDevolucoes
      }

      const setEntidade = settersPorTab[tab]
      const entidadeSalva = result.data.result

      setEntidade((entidades) => entidades.map((e) => e.id == entidadeSalva.id ? entidadeSalva : e))

      setModal({open: false, mode: 'add', register: null})

      buscarApi()
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message
      setError(message)
    }
  }

  const deletar = async (id) => {
    try {
      setError('')
      setMsg('')

      const result = await api.delete(`${tab}/${id}`)

      setMsg(result.data.message)

      const settersPorTab = {
        usuarios: setUsuarios,
        livros: setLivros
      }

      const setEntidade = settersPorTab[tab]
      const entidadeDeletada = result.data.result

      setEntidade((entidades) => entidades.filter((e) => e.id != entidadeDeletada.id))

      buscarApi()
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.error
      setError(message)
    }
  }

  let conteudo;
  let formulario;
  let filtros;

  switch (tab) {
    case 'usuarios':
      formulario = (
        <>
          <div className="label-input">
            <label htmlFor="nome">Nome</label>
            <input defaultValue={modal.register?.nome || ''} name='nome' id='nome' type="text" aria-label='Input-modal' placeholder='Digite seu nome' required/>
          </div>
          <div className="label-input">
            <label htmlFor="cpf">Cpf</label>
            <input defaultValue={modal.register?.cpf || ''} name='cpf' id='cpf' type="text" aria-label='Input-modal' placeholder='Digite seu cpf' required/>
          </div>
          <div className="label-input">
            <label htmlFor="email">Email</label>
            <input defaultValue={modal.register?.email || ''} name='email' id='email' type="email" aria-label='Input-modal' placeholder='Digite seu email' required/>
          </div>
          <div className="label-input">
            <label htmlFor="senha">Senha</label>
            <input defaultValue={modal.register?.senha || ''} name='senha' id='senha' type="password" aria-label='Input-modal' placeholder='Digite seu senha'/>
          </div>
          <div className="label-input">
            <label htmlFor="telefone">Telefone</label>
            <input defaultValue={modal.register?.telefone || ''} name='telefone' id='telefone' type="text" aria-label='Input-modal' placeholder='Digite seu telefone' required/>
          </div>
          <div className="label-input">
            <label htmlFor="data_nascimento">Data nascimento</label>
            <input defaultValue={dataConvertida(modal.register?.data_nascimento, 'modal') || ''} name='data_nascimento' id='data_nascimento' type="date" aria-label='Input-modal' placeholder='Digite sua data de nascimento' required/>
          </div>
          <div className="label-input">
            <label htmlFor="endereco">Endereço</label>
            <input defaultValue={modal.register?.endereco || ''} name='endereco' id='endereco' type="text" aria-label='Input-modal' placeholder='Digite seu endereco' required/>
          </div>
          <div className="label-input">
            <label htmlFor="perfil">Perfil</label>
            <select defaultValue={modal.register?.perfil || ''} name="perfil" id="perfil" required>
              <option value="" disabled>Selecione seu perfil</option>
              <option value="admin">Admin</option>
              <option value="atendente">Atendente</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
        </>
      )
      conteudo = paginar(usuarios).map((e) =>
        <article className="card-content">
          <div className="box-text">
            <p>Nome: {e.nome}</p>
            <p>Perfil: {e.perfil}</p>
            <p>Status: {e.ativo ? '🟢 Ativo' : '🔴 Inativo'}</p>
          </div>
          <div className="box-btns">
            <button disabled={!isAdmin} aria-label='editar' onClick={() => setModal({open: true, mode: 'att', register: e})}>Editar</button>
            <button disabled={!isAdmin} aria-label='arquivar' onClick={() => alterarAtivo(e.id)}>{e.ativo ? 'Arquivar' : 'Desarquivar'}</button>
            <button disabled={!isAdmin} aria-label='deletar' onClick={() => deletar(e.id)}>Deletar</button>
          </div>
        </article>
      )
      break;
    case 'autores':
      formulario = (
        <>
          <div className="label-input">
            <label htmlFor="nome">Nome</label>
            <input defaultValue={modal.register?.nome || ''} name='nome' id='nome' type="text" aria-label='Input-modal' placeholder='Digite o nome do autor' required/>
          </div>
          <div className="label-input">
            <label htmlFor="nascionalidade">Nascionalidade</label>
            <input defaultValue={modal.register?.nascionalidade || ''} name='nascionalidade' id='nascionalidade' type="text" aria-label='Input-modal' placeholder='Digite a nascionalidade do autor' required/>
          </div>
          <div className="label-input">
            <label htmlFor="data_nascimento">Data nascimento</label>
            <input defaultValue={dataConvertida(modal.register?.data_nascimento, 'modal') || ''} name='data_nascimento' id='data_nascimento' type="date" aria-label='Input-modal' placeholder='Digite a data de nascimento do autor' required/>
          </div>
        </>
      )
      conteudo = paginar(autores).map((e) =>
        <article className="card-content">
          <div className="box-text">
            <p>Nome: {e.nome}</p>
            <p>Nascionalidade: {e.nascionalidade}</p>
            <p>Data Nascimento: {dataConvertida(e.data_nascimento)}</p>
          </div>
          <div className="box-btns">
            <button disabled={!isAdmin} aria-label='editar' onClick={() => setModal({open: true, mode: 'att', register: e})}>Editar</button>
            <button disabled={!isAdmin} aria-label='arquivar' onClick={() => alterarAtivo(e.id)}>{e.ativo ? 'Arquivar' : 'Desarquivar'}</button>
          </div>
        </article>
      )
      break;
    case 'categorias':
      formulario = (
        <>
          <div className="label-input">
            <label htmlFor="nome">Nome</label>
            <input defaultValue={modal.register?.nome || ''} name='nome' id='nome' type="text" aria-label='Input-modal' placeholder='Digite o nome da categoria' required/>
          </div>
          <div className="label-input">
            <label htmlFor="descricao">Descrição</label>
            <input defaultValue={modal.register?.descricao || ''} name='descricao' id='descricao' type="text" aria-label='Input-modal' placeholder='Digite a descrição da categoria' required/>
          </div>

        </>
      )
      conteudo = paginar(categorias).map((e) =>
        <article className="card-content">
          <div className="box-text">
            <p>Nome: {e.nome}</p>
            <p>Descrição: {e.descricao}</p>
          </div>
          <div className="box-btns">
            <button aria-label='editar' onClick={() => setModal({open: true, mode: 'att', register: e})}>Editar</button>
            <button aria-label='arquivar' onClick={() => alterarAtivo(e.id)}>{e.ativo ? 'Arquivar' : 'Desarquivar'}</button>
          </div>
        </article>
      )
      break;
    case 'livros':
      filtros = (
        <>
          <p>Filtros:</p>
          <input type="text" onChange={(e) => setInputBuscaLivro(e.target.value)} placeholder='Pesquise por (Titulo, Autor, Categoria)' aria-label='filtro'/>
        </>
      )
      formulario = (
        <>
          <div className="label-input">
            <label htmlFor="isbn">Isbn</label>
            <input defaultValue={modal.register?.livro.isbn || ''} name='isbn' id='isbn' type="text" aria-label='Input-modal' placeholder='Digite o isbn do livro' required/>
          </div>
          <div className="label-input">
            <label htmlFor="titulo">Titulo</label>
            <input defaultValue={modal.register?.livro.titulo || ''} name='titulo' id='titulo' type="text" aria-label='Input-modal' placeholder='Digite o titulo do livro' required/>
          </div>
          <div className="label-input">
            <label htmlFor="ano_publicacao">Ano publicação</label>
            <input defaultValue={modal.register?.livro.ano_publicacao || ''} name='ano_publicacao' id='ano_publicacao' type="text" aria-label='Input-modal' placeholder='Digite o ano de publicacao do livro' required/>
          </div>
          <div className="label-input">
            <label htmlFor="edicao">Edição</label>
            <input defaultValue={modal.register?.livro.edicao || ''} name='edicao' id='edicao' type="text" aria-label='Input-modal' placeholder='Digite o edicao do livro' required/>
          </div>
          <div className="label-input">
            <label htmlFor="editora">Editora</label>
            <input defaultValue={modal.register?.livro.editora || ''} name='editora' id='editora' type="text" aria-label='Input-modal' placeholder='Digite o editora do livro' required/>
          </div>
          <div className="label-input">
            <label htmlFor="categoria_id">Categoria</label>
            <select defaultValue={modal.register?.livro.categoria_id || ''} name="categoria_id" id="categoria_id" required>
              <option value="" disabled>Selecione o categoria</option>
              {categoriasAtivos.map((e) => 
                <option value={e.id} key={e.id}>{e.nome}</option>
              )}
            </select>
          </div>
          <div className="label-input">
            <label htmlFor="descricao">Descrição</label>
            <input defaultValue={modal.register?.livro.descricao || ''} name='descricao' id='descricao' type="text" aria-label='Input-modal' placeholder='Digite o descricao do livro' required/>
          </div>
          <div className="label-input">
            <label htmlFor="autor_id">Autor</label>
            <select defaultValue={modal.register?.autor.id || ''} name="autor_id" id="autor_id" required>
              <option value="" disabled>Selecione o autor</option>
              {autoresAtivos.map((e) => 
                <option value={e.id} key={e.id}>{e.nome}</option>
              )}
            </select>
          </div>
        </>
      )
      conteudo = paginar(livrosFiltrados).map((e) =>
        <article className="card-content">
          <div className="box-text">
            <p>Isbn: {e.livro.isbn}</p>
            <p>Titulo: {e.livro.titulo}</p>
            <p>Descrição: {e.livro.descricao}</p>
          </div>
          <div className="box-btns">
            <button disabled={!isAdmin} aria-label='editar' onClick={() => setModal({open: true, mode: 'att', register: e})}>Editar</button>
            <button disabled={!isAdmin} aria-label='arquivar' onClick={() => alterarAtivo(e.id)}>{e.ativo ? 'Arquivar' : 'Desarquivar'}</button>
            <button disabled={!isAdmin} aria-label='deletar' onClick={() => deletar(e.livro.id)}>Deletar</button>
          </div>
        </article>
      )
      break;
    case 'exemplares':
      filtros = (
        <>
          <select defaultValue={exemplarStatus} onChange={(e) => setExemplarStatus(e.target.value)} name="exemplar_status" id="exemplar_status">
            <option value="">Status</option>
            <option value="disponivel">Disponivel</option>
            <option value="emprestado">Emprestado</option>
          </select>
        </>
      )
      formulario = (
        <>
          <div className="label-input">
            <label htmlFor="cod_identificacao">Identificação</label>
            <input defaultValue={modal.register?.cod_identificacao || ''} name='cod_identificacao' id='cod_identificacao' type="text" aria-label='Input-modal' placeholder='Digite a identificação do exemplar' required/>
          </div>
          <div className="label-input">
            <label htmlFor="livro_id">Livro</label>
            <select defaultValue={modal.register?.livro.id || ''} name="livro_id" id="livro_id" required>
              <option value="" disabled>Selecione o livro</option>
              {livrosAtivos.map((e) => 
                <option value={e.livro.id} key={e.livro.id}>{e.livro.titulo}</option>
              )}
            </select>
          </div>
          <div className="label-input">
            <label htmlFor="data_aquisicao">Data aquisição</label>
            <input defaultValue={dataConvertida(modal.register?.data_aquisicao, 'modal') || ''} name='data_aquisicao' id='data_aquisicao' type="date" aria-label='Input-modal' placeholder='Digite a data de aquisição do exemplar' required/>
          </div>
          <div className="label-input">
            <label htmlFor="estado_conservacao">Estado conservação</label>
            <input defaultValue={modal.register?.estado_conservacao || ''} name='estado_conservacao' id='estado_conservacao' type="text" aria-label='Input-modal' placeholder='Digite o estado de conservação do exemplar' required/>
          </div>
          <div className="label-input">
            <label htmlFor="status">Status</label>
            <select defaultValue={modal.register?.status || ''} name="status" id="status" required>
              <option value="" disabled>Selecione o status do exemplar</option>
              <option value="disponivel">Disponivel</option>
              <option value="emprestado">Emprestado</option>
              <option value="danificado">Danificado</option>
              <option value="perdido">Perdido</option>
              <option value="indisponivel">Indisponivel</option>
            </select>
          </div>
        </>
      )
      conteudo = paginar(exemplarFiltrado).map((e) =>
        <article className="card-content">
          <div className="box-text">
            <p>Identificação: {e.cod_identificacao}</p>
            <p>Titulo: {e.livro.titulo}</p>
            <p>Status: {e.status}</p>
          </div>
          <div className="box-btns">
            <button disabled={!isAdmin} aria-label='editar' onClick={() => setModal({open: true, mode: 'att', register: e})}>Editar</button>
            <button disabled={!isAdmin} aria-label='arquivar' onClick={() => alterarAtivo(e.id)}>{e.ativo ? 'Arquivar' : 'Desarquivar'}</button>
          </div>
        </article>
      )
      break;
    case 'emprestimos':
      filtros = (
        <>
          <select defaultValue={emprestimosStatus} onChange={(e) => setEmprestimosStatus(e.target.value)} name="emprestimo_status" id="emprestimo_status">
            <option value="">Status</option>
            <option value="em aberto">Em aberto</option>
            <option value="em atraso">Em atraso</option>
          </select>
            <select defaultValue={usuarioEmprestimo} onChange={(e) => setUsuarioEmprestimo(e.target.value)} name="usuario_id" id="usuario_id" required>
              <option value="">Cliente</option>
              {clientesAtivos.map((e) => 
                <option value={e.id} key={e.id}>{e.nome}</option>
              )}
            </select>
        </>
      )
      formulario = (
        <>
          <div className="label-input">
            <label htmlFor="usuario_id">Cliente</label>
            <select defaultValue={''} name="usuario_id" id="usuario_id" required>
              <option value="" disabled>Selecione o cliente</option>
              {clientesAtivos.map((e) => 
                <option value={e.id} key={e.id}>{e.nome}</option>
              )}
            </select>
          </div>
          <input hidden defaultValue={user.id} name='funcionario_id' id='funcionario_id' type="text" aria-label='Input-modal' placeholder='funcionario' required/>
          <div className="label-input">
            <label htmlFor="exemplar_id">Exemplar</label>
            <select defaultValue={modal.register?.livro.id || ''} name="exemplar_id" id="exemplar_id" required>
              <option value="" disabled>Selecione o exemplar</option>
              {disponiveis.map((e) => 
                <option value={e.id} key={e.id}>{e.livro.titulo} | {e.cod_identificacao}</option>
              )}
            </select>
          </div>
        </>
      )
      conteudo = paginar(emprestimosFiltrados).map((e) =>
        <article className="card-content">
          <div className="box-text">
            <p>Identificação: {e.exemplar.cod_identificacao}</p>
            <p>Titulo: {e.exemplar.livro.titulo}</p>
            <p>Status: {e.emprestimo.status}</p>
          </div>
        </article>
      )
      break;
    case 'devolucoes':
      formulario = (
        <>
          <div className="label-input">
            <label htmlFor="emprestimo_id">Emprestimo</label>
            <select defaultValue={''} name="emprestimo_id" id="emprestimo_id" required>
              <option value="" disabled>Selecione o emprestimo</option>
              {emprestimosAtivos.map((e) => 
                <option value={e.emprestimo.id} key={e.emprestimo.id}>{e.exemplar.livro.titulo} | {e.emprestimo.usuario_emprestimo_usuario_idTousuario.email}</option>
              )}
            </select>
          </div>
          <input hidden defaultValue={user.id} name='funcionario_id' id='funcionario_id' type="text" aria-label='Input-modal' placeholder='funcionario' required/>
          <div className="label-input">
            <label htmlFor="situacao">Situação</label>
            <input defaultValue={''} name='situacao' id='situacao' type="text" aria-label='Input-modal' placeholder='Digite a situação do exemplar' required/>
          </div>
        </>
      )
      conteudo = paginar(devolucoes).map((e) =>
        <article className="card-content">
          <div className="box-text">
            <p>Identificação: {e.emprestimo.emprestimo_exemplar[0].exemplar.cod_identificacao}</p>
            <p>Titulo: {e.emprestimo.emprestimo_exemplar[0].exemplar.livro.titulo}</p>
            <p>Data Devolução: {dataConvertida(e.data_devolucao)}</p>
          </div>
        </article>
      )
      break;
  
    default:
      <p>Dado não encontrado</p>
      break;
  }

  return (
    <main id="home">
      <section className='title'>
        <div>
          <div>
            <img src={logo} alt="logo" />
          </div>
          <div className="box-text">
            <h1>Painel Administrativo</h1>
            <p>Gerencie todos os recursos da plataforma</p>
          </div>
        </div>
        <button aria-label='SAIR' onClick={logout}>SAIR</button>
      </section>

      <section className="cards">
        <article className="card">
          <div>
            <p>Total de titulos</p>
            <h2>{livrosAtivos.length}</h2>
          </div>
          <div>
            <i className="fa-solid fa-book"></i>
          </div>
        </article>
        <article className="card">
          <div>
            <p>Total de exemplares</p>
            <h2>{exemplaresAtivos.length}</h2>
          </div>
          <div>
            <i className="fa-solid fa-book-open"></i>
          </div>
        </article>
        <article className="card">
          <div>
            <p>Exemplares disponiveis</p>
            <h2>{disponiveis.length}</h2>
          </div>
          <div>
            <i className="fa-solid fa-check"></i>
          </div>
        </article>
        <article className="card">
          <div>
            <p>Exemplares emprestados</p>
            <h2>{emprestados.length}</h2>
          </div>
          <div>
            <i className="fa-solid fa-hand-holding"></i>
          </div>
        </article>
      </section>

      <section className="tabs-content">
        <div className="tabs">
          <button aria-label='tab' className={tab == 'usuarios' ? 'tab active' : 'tab'} onClick={() => setTab('usuarios')}>Usuarios</button>
          <button disabled={!isAdmin} aria-label='tab' className={tab == 'autores' ? 'tab active' : 'tab'} onClick={() => setTab('autores')}>Autores</button>
          <button disabled={!isAdmin} aria-label='tab' className={tab == 'categorias' ? 'tab active' : 'tab'} onClick={() => setTab('categorias')}>Categorias</button>
          <button aria-label='tab' className={tab == 'livros' ? 'tab active' : 'tab'} onClick={() => setTab('livros')}>Livros</button>
          <button aria-label='tab' className={tab == 'exemplares' ? 'tab active' : 'tab'} onClick={() => setTab('exemplares')}>Exemplares</button>
          <button aria-label='tab' className={tab == 'emprestimos' ? 'tab active' : 'tab'} onClick={() => setTab('emprestimos')}>Emprestimos</button>
          <button aria-label='tab' className={tab == 'devolucoes' ? 'tab active' : 'tab'} onClick={() => setTab('devolucoes')}>Devoluções</button>
        </div>
      </section>

      <section className="box-info">
        <div className="box-content">
          <h2>Gerenciar {tab}</h2>
          <button disabled={!isAdmin && tab != 'emprestimos' && tab != 'devolucoes'} className='btn-adc' aria-label='adicionar' onClick={() => setModal({open: true, mode: 'add', register: null})}>Adicionar</button>
        </div>
        <div className="filtros">
          {filtros}
        </div>
      </section>

      <section className="cards-content">
        {conteudo}
      </section>

      <div className="paginacao">
        <button
          disabled={paginaAtual === 1}
          onClick={() => setPaginaAtual(paginaAtual - 1)}
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>

        <span>Página {paginaAtual}</span>

        <button
          disabled={paginaAtual * itensPorPagina >= listaAtual.length}
          onClick={() => setPaginaAtual(paginaAtual + 1)}
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>


      {error? <Toast tipo="error" message={error}/> : null}
      {msg? <Toast tipo="message" message={msg}/> : null}
      {modal.open? <Modal titulo={modal.mode == 'add' ? `Adicionar ${tab}` : `Editar ${tab}`} onClose={() => setModal({open: false, mode: 'add', register: null})} onSubmit={enviarFormulario} formulario={formulario}/> : null}
    </main>
  )
}

export default Home
