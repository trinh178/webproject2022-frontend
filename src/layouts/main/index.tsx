import { Outlet } from 'react-router-dom';
import "./styles.scss";

export default function Layout() {
    return <div className='layout-wrapper'>
        <div className='layout-content'>
            <Outlet />
        </div>
    </div>
}