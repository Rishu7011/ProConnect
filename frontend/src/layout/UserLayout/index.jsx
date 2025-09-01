import NavBarComponent from "../../components/Navbar";



function UserLayout({children}) {
    return ( 
        <div>
           <NavBarComponent/>
               
               {children}
           
            
        </div>
     );
}

export default UserLayout;