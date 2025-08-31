import NavBarComponent from "../../components/Navbar/index.jsx";



function UserLayout({children}) {
    return ( 
        <div>
           <NavBarComponent/>
               
               {children}
           
            
        </div>
     );
}

export default UserLayout;