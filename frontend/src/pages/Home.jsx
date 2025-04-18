import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container py-4">
      <h1 className="display-4 text-center mb-4">Welcome to Country Explorer</h1>
      <div className="d-flex justify-content-center gap-3 flex-wrap">
        <Link to="/countries" className="btn btn-primary">
          Browse Countries
        </Link>
        <Link to="/register" className="btn btn-success">
          Register
        </Link>
        <Link to="/login" className="btn btn-info">
          Login
        </Link>
        <Link to="/favorites" className="btn btn-warning">
          Favorites
        </Link>
      </div>
    </div>
  );
}

export default Home;