import React, { useState } from "react";
import { getKeycloak } from "../keycloak";
import { useCart } from "../context/CartContext";
import { ShoppingBag, Trash2 } from "lucide-react";

// Utility function
const cn = (...classes) => classes.filter(Boolean).join(" ");

const themeColors = `
  :root {
    --primary: 45 93% 58%;
    --primary-foreground: 0 0% 0%;
    --accent: 45 100% 96%;
    --border: 45 60% 88%;
    --foreground: 0 0% 0%;
    --muted-foreground: 0 0% 40%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 0%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --muted: 45 100% 96%;
    --background: 0 0% 100%;
  }
`;

// Card Components
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <>
    <style>{themeColors}</style>
    <div
      ref={ref}
      className={cn("rounded-lg bg-card text-card-foreground", className)}
      {...props}
    />
  </>
));
Card.displayName = "Card";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-2 items-stretch p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Button
const buttonVariants = (variant = "default", size = "default") => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
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

const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants(variant, size), className)}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

// CommentSection
const CommentSection = ({
  comments,
  onAddComment,
  onDeleteComment,
  isAdmin,
}) => {
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
          <div
            key={comment.id}
            className="flex justify-between items-start bg-accent/50 p-3 rounded-lg"
          >
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
                onClick={() => onDeleteComment(comment.id)}
                className="h-10 w-10 p-0 pointer-events-auto"
                aria-label="Eliminar comentario"
                title="Eliminar comentario"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ProductCard
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

  // Eliminar producto (solo admin)
  const handleDeleteProduct = async () => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    const keycloak = getKeycloak();
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${keycloak.token}` },
        }
      );

      if (res.ok) {
        onDeleteProduct?.(id);
        alert("Producto eliminado correctamente");
      } else {
        const text = await res.text();
        alert("Error al eliminar producto: " + text);
      }
    } catch (err) {
      console.error(err);
      alert("Error al eliminar producto");
    }
  };

  const handleAddComment = async (text) => {
    if (!id) return;
    const keycloak = getKeycloak();
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${keycloak.token}`,
          },
          body: JSON.stringify({ content: text }),
        }
      );
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        onCommentAdded?.(id, newComment);
      } else console.error(await res.text());
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const keycloak = getKeycloak();
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/comments/${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${keycloak.token}` },
        }
      );
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        onCommentRemoved?.(id, commentId);
      } else console.error(await res.text());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 border-0 shadow-md bg-white">
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
        <div className="absolute top-2 right-2 bg-white text-primary-foreground px-3 py-1.5 rounded-full text-base font-bold shadow-lg">
          ${typeof price === "number" ? price.toFixed(2) : "0.00"}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <CardContent className="pt-4">
        <h3 className="font-semibold text-lg mb-2 text-foreground line-clamp-1">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
          {description}
        </p>
      </CardContent>

      <CardFooter>
        {!isAdmin && (
          <Button
            onClick={(e) => {
              // ✅ Recibir el evento 'e' como parámetro
              e.stopPropagation();
              addToCart({ id, name, price, image });
            }}
            className="w-full"
            size="lg"
          >
            <ShoppingBag className="w-4 h-4 mr-2" /> Agregar al Carrito
          </Button>
        )}

        {isAdmin && (
          <Button
            onClick={(e) => {
              e.stopPropagation(); // ✅ Evita que se abra el detalle
              handleDeleteProduct();
            }}
            variant="destructive"
            size="lg"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Eliminar Producto
          </Button>
        )}
        {showComments && (
          <CommentSection
            comments={comments}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            isAdmin={isAdmin}
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
