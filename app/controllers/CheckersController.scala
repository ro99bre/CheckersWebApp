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
}
