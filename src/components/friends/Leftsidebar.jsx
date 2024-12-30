import React from 'react';
import { BsPeople, BsPeopleFill } from "react-icons/bs";
import { GiThreeFriends } from "react-icons/gi";
import SidebarRow from "../homepage/sidebar/LeftSidebarRow";
import { useLocation, Link } from 'react-router-dom';
import "./leftsidebar.css";

export const Leftsidebar = () => {
    const location = useLocation(); // Lấy thông tin về đường dẫn hiện tại

    // Hàm kiểm tra xem đường dẫn có khớp với tên mục hay không
    const isActive = (path) => {
        const currentPath = new URL(window.location.href).pathname; // Lấy pathname hiện tại
        return currentPath === path; 
    };

    return (
        <div className="sidebar1">
            <Link to="/friends">
                <SidebarRow  
                    Icon={<BsPeople color={isActive("/friends") ? "blue" : "black"} />}  // Thay đổi màu của icon dựa trên isActive
                    title={<span style={{ color: isActive("/friends") ? "blue" : "black" }}>Friend Request</span>} // Thay đổi màu của title
                />
            </Link>
            <Link to="/friends/suggestions">
                <SidebarRow  
                    Icon={<BsPeopleFill color={isActive("/friends/suggestions") ? "blue" : "black"} />} 
                    title={<span style={{ color: isActive("/friends/suggestions") ? "blue" : "black" }}>Suggestions</span>} // Thay đổi màu của title
                />
            </Link>
            <Link to="/friends/all-friends">
                <SidebarRow  
                    Icon={<GiThreeFriends color={isActive("/friends/all-friends") ? "blue" : "black"} />} 
                    title={<span style={{ color: isActive("/friends/all-friends") ? "blue" : "black" }}>All Friends</span>} // Thay đổi màu của title
                />
            </Link>
        </div>
    );
};
