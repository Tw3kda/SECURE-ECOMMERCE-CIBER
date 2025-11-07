import React, { useState } from "react";
import { getKeycloak } from "../keycloak";
import { useCart } from "../context/CartContext";
import { ShoppingBag } from "lucide-react";

// Utility function
const cn = (...classes) => classes.filter(Boolean).join(' ');

// 🎨 TEMA AMARILLO - Estilo Arepas Artesanales
const themeColors = `
  :root {
    --primary: 45 93% 58%;            /* Amarillo (botones, badges) */
    --primary-foreground: 0 0% 0%;    /* Texto sobre amarillo - Negro */
    --accent: 45 100% 96%;            /* Amarillo muy claro (fondos sutiles) */
    --border: 45 60% 88%;             /* Bordes amarillo claro */
    --foreground: 0 0% 0%;            /* Texto principal - Negro */
    --muted-foreground: 0 0% 40%;     /* Texto secundario - Gris oscuro */
    --card: 0 0% 100%;                /* Fondo de tarjeta - Blanco */
    --card-foreground: 0 0% 0%;       /* Texto en tarjeta - Negro */
    --destructive: 0 84% 60%;         /* Rojo para eliminar */
    --destructive-foreground: 0 0% 100%; /* Texto sobre rojo - Blanco */
    --muted: 45 100% 96%;             /* Amarillo apagado */
    --background: 0 0% 100%;          /* Fondo general - Blanco */
  }
`;

// Card Components
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <>
    <style>{themeColors}</style>
    <div ref={ref} className={cn("rounded-lg bg-card text-card-foreground", className)} {...props} />
  </>
));
Card.displayName = "Card";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

// Button Component
const buttonVariants = (variant = "default", size = "default") => {
  const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
  };
  
  return `${baseClasses} ${variants[variant]} ${sizes[size]}`;
};

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button 
      className={cn(buttonVariants(variant, size), className)} 
      ref={ref} 
      {...props} 
    />
  );
});
Button.displayName = "Button";

const CommentSection = ({ comments, onAddComment, onDeleteComment, isAdmin }) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      {!isAdmin && (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            className="w-full p-2 border rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button type="submit" className="mt-2" disabled={!newComment.trim()}>
            Añadir Comentario
          </Button>
        </form>
      )}
      
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex justify-between items-start bg-accent/50 p-3 rounded-lg">
            <div>
              <p className="text-sm font-semibold">{comment.author}</p>
              <p className="text-sm text-muted-foreground">{comment.content}</p>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            {isAdmin && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => { console.log('delete click', comment.id); onDeleteComment(comment.id); }}
                className="h-10 w-10 p-0 pointer-events-auto relative z-20"
                aria-label="Eliminar comentario"
                title="Eliminar comentario"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductCard = ({
  image,
  name,
  description,
  price = 0,
  rating = 0,
  reviewCount = 0,
  commentCount = 0,
  onViewReviews,
  isAdmin = false,
  onDeleteProduct,
  productId: id,
  initialComments = [],
  onCommentAdded,
  onCommentRemoved,
}) => {
  const { addToCart } = useCart();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(initialComments || []);
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      onDeleteProduct?.();
    }
  };

  // Comentarios iniciales provienen del padre (GET /api/products devuelve comments en ProductDTO)

  const handleAddComment = async (text) => {
    if (!productId) {
      console.error("ProductId is undefined");
      return;
    }

    const keycloak = getKeycloak();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${keycloak.token}`
        },
        body: JSON.stringify({
          content: text
        })
      });
      
      if (response.ok) {
        const newComment = await response.json();
        setComments(prev => [...prev, newComment]);
        // notify parent to update global products state
        if (typeof onCommentAdded === 'function') onCommentAdded(productId, newComment);
      } else {
        console.error("Error adding comment:", await response.text());
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const keycloak = getKeycloak();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${keycloak.token}`
        }
      });
      
      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        console.log('Comment deleted successfully:', commentId);
        // notify parent to update global products state
        if (typeof onCommentRemoved === 'function') onCommentRemoved(productId, commentId);
      } else {
        const text = await response.text();
        console.error("Error deleting comment:", response.status, text);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleViewComments = () => {
    setShowComments(!showComments);
  };

  const hasReviews = reviewCount > 0;
  const hasComments = commentCount > 0;

  return (
    <Card className="group overflow-hidden hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 border-0 shadow-md bg-white">
      {/* Imagen del producto */}
      <div className="relative overflow-hidden aspect-[4/3]">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        
        {/* Badge de precio flotante - Esquina superior derecha */}
        <div className="absolute top-2 right-2 bg-white text-primary-foreground px-3 py-1.5 rounded-full text-base font-bold shadow-lg">
          ${typeof price === 'number' ? price.toFixed(2) : '0.00'}
        </div>
        
        {/* Overlay hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Contenido */}
      <CardContent className="pt-4">
        {/* Título */}
        <h3 className="font-semibold text-lg mb-2 text-foreground line-clamp-1">
          {name}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
          {description}
        </p>

        {/* Estadísticas: Rating y Comentarios */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Rating */}
          {hasReviews && (
            <div className="flex items-center gap-1.5 bg-yellow-50 rounded-lg px-3 py-1.5 border border-yellow-200">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={index}
                    className={`w-3.5 h-3.5 ${
                      index < Math.floor(rating)
                        ? "fill-yellow-500 text-yellow-500"
                        : "fill-gray-300 text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-600">
                ({reviewCount})
              </span>
            </div>
          )}

          {/* Comentarios */}
          <div className="flex items-center gap-1.5 bg-yellow-50 rounded-lg px-3 py-1.5 border border-yellow-200">
            <svg className="w-3.5 h-3.5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-semibold text-gray-800">
              {commentCount}
            </span>
            <span className="text-xs text-gray-600">
              comentarios
            </span>
          </div>
        </div>
      </CardContent>

      {/* Botones */}
      <CardFooter className="flex-col gap-2 items-stretch">
        {/* Botón Agregar al Carrito */}
        <Button
          onClick={() => addToCart({ id, name, price, image })}
          className="w-full"
          size="lg"
          variant="default"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Agregar al Carrito
        </Button>

        {/* Botón Ver/Ocultar Comentarios */}
        <Button
          onClick={handleViewComments}
          className="w-full"
          size="lg"
          variant={showComments ? "outline" : "default"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {showComments ? "Ocultar Comentarios" : "Ver Comentarios"}
        </Button>
        
        {/* Sección de Comentarios */}
        {showComments && (
          loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <CommentSection
              comments={comments}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              isAdmin={isAdmin}
            />
          )
        )}

      </CardFooter>
    </Card>
  );
};

export default ProductCard;