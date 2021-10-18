package controllers

import javax.inject._
import play.api._
import play.api.mvc._

import com.google.inject.Guice
import de.htwg.se.checkers.CheckersModule
import de.htwg.se.checkers.control.ControllerComponent.ControllerTrait

/**
 * Routes:
 *   /              Prints out Welcome Screen/Index
 *   /newGame       Starts a new Game
 *   /printGame     Prints the current Game Board
 *   /move          Moves a Piece
 *   /undo          Retrieves the last move
 *   /redo          Redoes the retrived last move
 *   /save          Saves Game to a File on the Server
 *   /load          Loads Game from a File on the Server
*/

@Singleton
class CheckersController @Inject()(val controllerComponents: ControllerComponents) extends BaseController {

    val injector = Guice.createInjector(new CheckersModule)
    val controller = injector.getInstance(classOf[ControllerTrait])

    controller.createGame()

    def index() = Action { implicit request: Request[AnyContent] =>
        Ok(views.html.index())
    }

    def newGame() = Action { implicit request: Request[AnyContent] =>
        controller.createGame()
        Ok(controller.gameToString)
    }

    def printGame() = Action { implicit request: Request[AnyContent] =>
        Ok(controller.gameToString)
    }

    def move(sx: Int, sy: Int, dx: Int, dy: Int) = Action { implicit request: Request[AnyContent] =>
        controller.move(sx, sy, dx, dy)
        Ok(controller.gameToString)
    }

    def undo() = Action { implicit request: Request[AnyContent] =>
        controller.undo()
        Ok(controller.gameToString)
    }

    def redo() = Action { implicit request: Request[AnyContent] =>
        controller.redo()
        Ok(controller.gameToString)
    }

    def save() = Action { implicit request: Request[AnyContent] =>
        controller.save()
        Ok(controller.gameToString)
    }

    def load() = Action { implicit request: Request[AnyContent] =>
        controller.load()
        Ok(controller.gameToString)
    }
}
